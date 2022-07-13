from aws_cdk import (
    NestedStack,
    aws_ssm as ssm,
    aws_iam as iam
)
from constructs import Construct
from .constant import *

class SSMStack(NestedStack):
    def __init__(self, scope: Construct, s3_stack:NestedStack, **kwargs) -> None:
        super().__init__(scope, "SSM stack", **kwargs)

        lambda_data_access_role = iam.Role(self, "BatchTranslateDataAccessRole",
            assumed_by=iam.ServicePrincipal("translate.amazonaws.com"),
            description="Data access role for translation code in Lambda. Allow Amazon Translate to write result in S3"
        )
        
        lambda_data_access_role.attach_inline_policy(iam.Policy(self, "DataAccessRole-ListS3AllBucket",
            statements=[
                iam.PolicyStatement(
                    actions=["s3:GetObject"],
                    resources=[f"{s3_stack.input_bucket.bucket_arn}/*", f"{s3_stack.output_bucket.bucket_arn}/*"]
                ),
                iam.PolicyStatement(
                    actions=["s3:ListBucket"],
                    resources=[s3_stack.input_bucket.bucket_arn, s3_stack.output_bucket.bucket_arn]
                ),
                iam.PolicyStatement(
                    actions=["s3:PutObject"],
                    resources=[f"{s3_stack.output_bucket.bucket_arn}/*"]
                )
            ]
        ))

        ssm.CfnParameter(self, "SSMDataAccessRoleArn", 
            name="/amztrans/lambda/data-access-role-arn",
            type="String",
            value=lambda_data_access_role.role_arn
        )
        ssm.CfnParameter(self, "SSMS3OutputBucketName",
            name="/amztrans/lambda/s3-output-bucket",
            type="String",
            value=s3_stack.output_bucket.bucket_name
        )