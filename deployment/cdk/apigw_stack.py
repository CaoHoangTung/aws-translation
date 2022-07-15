from aws_cdk import (
    NestedStack,
    aws_apigateway as apigateway,
    aws_ecs_patterns as ecsp,
    aws_lambda as lambda_,
    aws_cognito as cognito
)
from constructs import Construct

class APIGatewayStack(NestedStack):

    def __init__(self, scope: Construct, lambda_stack: NestedStack, cognito_stack: NestedStack,  **kwargs) -> None:
        super().__init__(scope, "API Gateway Stack", **kwargs)

        # Define API Gateway
        api = apigateway.RestApi(self, "ProxyToLambdaFunctions",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_headers=[
                    "Content-Type",
                    "X-Amz-Date",
                    "Authorization",
                    "X-Api-Key",
                ],
                allow_methods=["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
                allow_credentials=True,
                allow_origins=["*"],
            ),
            deploy=True,
            endpoint_configuration=apigateway.EndpointConfiguration(
                types=[apigateway.EndpointType.REGIONAL]
            )
        )

        apigw_authorizer = apigateway.CognitoUserPoolsAuthorizer(self, "TestAuthorizer",
            cognito_user_pools=[cognito.UserPool.from_user_pool_arn(self, "TestUserPool", cognito_stack.user_pool.attr_arn)]
        )

        list_jobs_integration = apigateway.LambdaIntegration(lambda_stack.list_handler)
        describe_job_integration = apigateway.LambdaIntegration(lambda_stack.describe_handler)
        create_job_integration = apigateway.LambdaIntegration(lambda_stack.create_handler, 
            proxy=False,
            integration_responses=[
                apigateway.IntegrationResponse(status_code="200",
                    response_parameters={"method.response.header.Access-Control-Allow-Origin": "'*'"}
                )
            ]
        )

        
        # Add resource and method for Lambda proxy request
        jobs_resource = api.root.add_resource("jobs")

        list_resource = jobs_resource.add_resource("list")
        describe_resource = jobs_resource.add_resource("describe")
        create_resource = jobs_resource.add_resource("create")
        
        list_resource.add_method("GET", list_jobs_integration,
            authorizer=apigw_authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )
        describe_resource.add_method("GET", describe_job_integration,
            authorizer=apigw_authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO
        )
        create_resource.add_method("POST", create_job_integration,
            authorizer=apigw_authorizer,
            authorization_type=apigateway.AuthorizationType.COGNITO,
            method_responses=[
                apigateway.MethodResponse(status_code="200",
                    response_parameters={"method.response.header.Access-Control-Allow-Origin": True},
                )
            ]
        )

        deployment = apigateway.Deployment(self, "Deployment", api=api)

        self.url = api.url
