from aws_cdk import (
    NestedStack,
    Duration,
    CfnOutput,
    RemovalPolicy,
    aws_s3_deployment as s3_deployment,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as cloudfront_origins
)
from constructs import Construct
from .constant import *

class StaticHostStack(NestedStack):

    def __init__(self, scope: Construct, env="prod", **kwargs) -> None:
        super().__init__(scope, "Static host", **kwargs)
        
        if env != "prod":
            self.static_s3_bucket_name = "None"
            self.cloudfront_url = "http://localhost:3000"
        else:
            static_bucket = s3.Bucket(self, "amztrans-static",
                removal_policy=RemovalPolicy.DESTROY, 
                auto_delete_objects=True,
            )

            # Define bucket deployment
            static_bucket_deployment = s3_deployment.BucketDeployment(self, "AmzTransStaticBucket", 
                sources=[s3_deployment.Source.asset(FRONTEND_ASSETS)],
                destination_bucket=static_bucket
            )

            origin_access_identity = cloudfront.OriginAccessIdentity(self, "AmzTransOriginAccessIdentity")
            static_bucket.grant_read(origin_access_identity)

            cloudfront_distribution = cloudfront.Distribution(self, "AmzTransCloudFrontDistribution",
                default_root_object="index.html",
                error_responses=[cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(30)
                )],
                default_behavior=cloudfront.BehaviorOptions(
                    origin=cloudfront_origins.S3Origin(static_bucket, 
                        origin_access_identity=origin_access_identity
                    )
                )
            )

            self.static_s3_bucket_name = static_bucket.bucket_name
            self.cloudfront_url = f"https://{cloudfront_distribution.distribution_domain_name}"