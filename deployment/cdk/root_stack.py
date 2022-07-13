from aws_cdk import (
    Stack,
    CfnOutput
)
from constructs import Construct
from .s3_stack import S3Stack
from .lambda_stack import LambdaStack
from .apigw_stack import APIGatewayStack
from .cognito_stack import CognitoStack
from .ssm_stack import SSMStack

class RootStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        s3_stack = S3Stack(self)
        lambda_stack = LambdaStack(self)

        ssm_stack = SSMStack(self, s3_stack)
        
        cognito_stack = CognitoStack(self, s3_stack)

        apigw_stack = APIGatewayStack(self, lambda_stack, cognito_stack)


        CfnOutput(self, "INPUT_BUCKET_NAME", value=s3_stack.input_bucket.bucket_name)
        CfnOutput(self, "OUTPUT_BUCKET_NAME", value=s3_stack.output_bucket.bucket_name)

        CfnOutput(self, "APIGATEWAY_ENDPOINT", value=apigw_stack.url)

        CfnOutput(self, "IDENTITY_POOL_ID", value=cognito_stack.identity_pool.ref)
        CfnOutput(self, "COGNITO_USERPOOL_ENDPOINT", value=cognito_stack.userpool_endpoint)