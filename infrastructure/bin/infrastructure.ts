#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { AsyncRestApiStack } from "../lib/async-rest-api-stack";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new AsyncRestApiStack(app, AsyncRestApiStack.name, {
  env,
});
