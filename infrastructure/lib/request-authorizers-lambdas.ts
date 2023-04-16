import { Duration } from "aws-cdk-lib";
import { Architecture, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
const resolve = require("path").resolve;

interface RequstAuthorizersLambdasProps {
  applicationName: string;
}

export class RequestAuthorizersLambdas extends Construct {
  readonly createTaskAuthorizer: IFunction;
  readonly checkTaskStatusAuthorizer: IFunction;

  constructor(
    scope: Construct,
    id: string,
    props?: RequstAuthorizersLambdasProps
  ) {
    super(scope, id);

    const { applicationName } = props!;

    const lambdaConfig = {
      memorySize: 128,
      timeout: Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.THREE_DAYS,
    };

    this.createTaskAuthorizer = new NodejsFunction(
      this,
      `${applicationName}-create-task-authorizer`,
      {
        ...lambdaConfig,
        entry: resolve("../src/backend/lambdas/create-task-authorizer.ts"),
        functionName: `${applicationName}-create-task-authorizer`,
        handler: "handler",
      }
    );

    this.checkTaskStatusAuthorizer = new NodejsFunction(
      this,
      `${applicationName}-check-task-status-authorizer`,
      {
        ...lambdaConfig,
        entry: resolve(
          "../src/backend/lambdas/check-task-status-authorizer.ts"
        ),
        functionName: `${applicationName}-check-task-status-authorizer`,
        handler: "handler",
      }
    );
  }
}
