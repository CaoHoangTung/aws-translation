#!/usr/bin/env python3
import os

import aws_cdk as cdk

from cdk.root_stack import RootStack


app = cdk.App()
RootStack(app, "amztrans-demo")

app.synth()
