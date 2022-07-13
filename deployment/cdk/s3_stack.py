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
            removal_policy=RemovalPolicy.DESTROY, 
            auto_delete_objects=True,
            lifecycle_rules=[self.ONEDAY_DELETION_LIFECYCLE_RULE],
            cors=[s3.CorsRule(
                allowed_headers=["*"],
                allowed_methods=[s3.HttpMethods.PUT],
                allowed_origins=["*"],
            )]
        )
        self.output_bucket = s3.Bucket(self, "amztrans-output", 
            removal_policy=RemovalPolicy.DESTROY, 
            auto_delete_objects=True,
            lifecycle_rules=[self.ONEDAY_DELETION_LIFECYCLE_RULE],
            cors=[s3.CorsRule(
                allowed_headers=["*"],
                allowed_methods=[s3.HttpMethods.GET],
                allowed_origins=["*"],
            )]
        )