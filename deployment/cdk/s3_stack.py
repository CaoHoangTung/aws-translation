from aws_cdk import (
    NestedStack,
    aws_s3 as s3,
    RemovalPolicy,
    Duration
)
from constructs import Construct
from .constant import *

class S3Stack(NestedStack):
    ONEDAY_DELETION_LIFECYCLE_RULE = s3.LifecycleRule(expiration=Duration.hours(24))
    
    def __init__(self, scope: Construct, **kwargs) -> None:
        super().__init__(scope, "S3 stack", **kwargs)

        self.input_bucket = s3.Bucket(self, "amztrans-input", 
            removal_policy=RemovalPolicy.DESTROY,       # Delete the bucket when the stack is destroyed
            auto_delete_objects=True,                   # Delete the objects when the stack is destroyed
            lifecycle_rules=[
                self.ONEDAY_DELETION_LIFECYCLE_RULE     # Lifecycle policy to delete object 1 day after upload
            ],
            cors=[s3.CorsRule(
                allowed_headers=["*"],                  # Allow all HTTP header
                allowed_methods=[s3.HttpMethods.PUT],   # Only allow HTTP PUT method
                allowed_origins=["*"],                  # Allow all origins. In production, this should not be *
            )],
        )
        self.output_bucket = s3.Bucket(self, "amztrans-output", 
            removal_policy=RemovalPolicy.DESTROY,       # Delete the bucket when the stack is destroyed
            auto_delete_objects=True,                   # Delete the objects when the stack is destroyed
            lifecycle_rules=[
                self.ONEDAY_DELETION_LIFECYCLE_RULE     # Lifecycle policy to delete object 1 day after upload
            ],
            cors=[s3.CorsRule(
                allowed_headers=["*"],                  # Allow all HTTP header
                allowed_methods=[s3.HttpMethods.GET],   # Only allow HTTP GET method
                allowed_origins=["*"],                  # Allow all origins. In production, this should not be *
            )]
        )
