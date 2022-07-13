from aws_cdk import (
    NestedStack,
    aws_s3 as s3,
    aws_lambda as lambda_,
    aws_iam as iam
)
from constructs import Construct
from .constant import *

class LambdaStack(NestedStack):

    def __init__(self, scope: Construct, **kwargs) -> None:
        super().__init__(scope, "Lambda Stack", **kwargs)

        exec_role = iam.Role(self, "LambdaExecRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            description="Lamdba execution role. Allow Lambda to access Amazon Translate and Parameter Store"
        )
        exec_role.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("TranslateFullAccess"))
        exec_role.attach_inline_policy(iam.Policy(self, "DataAccessRole-ListS3AllBucket",
            statements=[
                iam.PolicyStatement(
                    actions=["iam:PassRole", "ssm:GetParameter"],
                    resources=["*"]
                )
            ]    
        ))

        # List translation jobs
        list_handler = lambda_.Function(self, f"translation-job-list",
                    runtime=lambda_.Runtime.PYTHON_3_9,
                    code=lambda_.Code.from_asset(LAMBDA_ASSETS),
                    handler="list_translation.lambda_handler",
                    role=exec_role
                )

        # Describe translation job info
        describe_handler = lambda_.Function(self, f"translation-job-describe",
                    runtime=lambda_.Runtime.PYTHON_3_9,
                    code=lambda_.Code.from_asset(LAMBDA_ASSETS),
                    handler="describe_translation.lambda_handler",
                    role=exec_role
                )

        # Create translation batch job
        create_handler = lambda_.Function(self, f"translation-job-create",
                    runtime=lambda_.Runtime.PYTHON_3_9,
                    code=lambda_.Code.from_asset(LAMBDA_ASSETS),
                    handler="create_translation.lambda_handler",
                    role=exec_role
                )
        
        self.list_handler = list_handler
        self.describe_handler = describe_handler
        self.create_handler = create_handler

        exec_role.attach_inline_policy(iam.Policy(self, "LambdaExecRole-CustomPolicy",
            statements=[iam.PolicyStatement(
                actions=[
                    "iam:PassRole",
                    "ssm:GetParameter"
                ],
                resources=[self.list_handler.function_arn, self.describe_handler.function_arn, self.create_handler.function_arn]
            )]
        ))
