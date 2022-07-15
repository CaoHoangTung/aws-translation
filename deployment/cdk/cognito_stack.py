from aws_cdk import (
    NestedStack,
    aws_cognito as cognito,
    aws_iam as iam
)
from constructs import Construct
from .constant import *

class CognitoStack(NestedStack):

    def __init__(self, scope: Construct, s3_stack: NestedStack, statichost_stack: NestedStack, **kwargs) -> None:
        super().__init__(scope, "Cognito Stack", **kwargs)

        user_pool = cognito.CfnUserPool(self, "amztrans-user-pool",
            schema=[
                cognito.CfnUserPool.SchemaAttributeProperty(
                    name="email",
                    required=True,
                    mutable=False
                ),
                cognito.CfnUserPool.SchemaAttributeProperty(
                    name="email_verified",
                    required=True,
                    mutable=True
                )
            ]
        )
        
        user_pool_id = user_pool.ref

        user_pool_client = cognito.CfnUserPoolClient(self, "AmzTransClient",
            user_pool_id=user_pool_id,
            allowed_o_auth_flows_user_pool_client=True,
            allowed_o_auth_flows=["implicit"],
            allowed_o_auth_scopes=["email", "openid"],
            callback_ur_ls=[f"{statichost_stack.cloudfront_url}/auth"]
        )
        user_pool_client.add_property_override("RefreshTokenValidity", 1)
        user_pool_client.add_property_override("SupportedIdentityProviders", ["COGNITO"])

        cfn_user_pool_domain = cognito.CfnUserPoolDomain(self, "AmzTransCognitoDomain",
            user_pool_id=user_pool_id,
            domain="amztrans-domain",
        )
        
        cfn_user_pool_user = cognito.CfnUserPoolUser(self, "DefaultUserPoolUser",
            user_pool_id=user_pool_id,
            force_alias_creation=False,
            username="public",
            user_attributes=[
                cognito.CfnUserPoolUser.AttributeTypeProperty(
                    name="email_verified",
                    value="true"
                ),
                cognito.CfnUserPoolUser.AttributeTypeProperty(
                    name="email",
                    value=DEFAULT_EMAIL
                ),
            ]
        )

        identity_pool = cognito.CfnIdentityPool(self, "amztrans-identity-pool",
            allow_unauthenticated_identities=True,
            cognito_identity_providers=[cognito.CfnIdentityPool.CognitoIdentityProviderProperty(
                client_id=user_pool_client.ref,
                provider_name=user_pool.attr_provider_name
            )]
        )


        unauth_role = iam.Role(self, "AmzTransCognitoUnauthRole",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": identity_pool.ref,
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "unauthenticated",
                    },
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
            description="Cognito anonymous role"
        )

        auth_role = iam.Role(self, "AmzTransCognitoAuthRole",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": identity_pool.ref,
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "authenticated",
                    },
                },
                "sts:AssumeRoleWithWebIdentity"
            ),
            description="Cognito authenticated role"
        )

        # Allow read write to input bucket
        unauth_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:PutObject"
                ],
                resources=[
                    f"{s3_stack.input_bucket.bucket_arn}",
                    f"{s3_stack.input_bucket.bucket_arn}/*"
                ]
            )
        )

        # Allow read write to output bucket
        unauth_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "s3:GetObject",
                    "s3:ListBucket"
                ],
                resources=[
                    f"{s3_stack.output_bucket.bucket_arn}",
                    f"{s3_stack.output_bucket.bucket_arn}/*"
                ]
            )
        )

        identity_pool_role_attachment = cognito.CfnIdentityPoolRoleAttachment(self, "IdentityPoolRoleAttachment",
            identity_pool_id=identity_pool.ref,
            roles={
                "authenticated": auth_role.role_arn,
                "unauthenticated": unauth_role.role_arn
            }
        )

        self.user_pool = user_pool
        self.identity_pool = identity_pool
        self.userpool_endpoint = f"https://{cfn_user_pool_domain.domain}.auth.{REGION}.amazoncognito.com/oauth2/authorize?client_id={user_pool_client.ref}&response_type=token&scope=email+openid&redirect_uri={user_pool_client.callback_ur_ls[0]}"