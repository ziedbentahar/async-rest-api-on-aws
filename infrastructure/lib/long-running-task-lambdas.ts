import { Duration } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Architecture, IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
const resolve = require("path").resolve;

interface LongRunningTasksLambdasProps {
  applicationName: string;
  taskTable: Table;
}

export class LongRunningTasksLambdas extends Construct {
  readonly lambda1: IFunction;
  readonly lambda2: IFunction;
  readonly lambda3: IFunction;

  constructor(
    scope: Construct,
    id: string,
    props?: LongRunningTasksLambdasProps
  ) {
    super(scope, id);

    const { applicationName, taskTable } = props!;

    const lambdaConfig = {
      memorySize: 128,
      timeout: Duration.seconds(60),
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      logRetention: RetentionDays.THREE_DAYS,
    };

    this.lambda1 = new NodejsFunction(this, `${applicationName}-lambda-1`, {
      ...lambdaConfig,
      entry: resolve("../src/backend/lambdas/lambda-1.ts"),
      functionName: `${applicationName}-lambda-1`,
      handler: "handler",
    });

    this.lambda2 = new NodejsFunction(this, `${applicationName}-lambda-2`, {
      ...lambdaConfig,
      entry: resolve("../src/backend/lambdas/lambda-2.ts"),
      functionName: `${applicationName}-lambda-2`,
      handler: "handler",
    });

    this.lambda3 = new NodejsFunction(this, `${applicationName}-lambda-3`, {
      ...lambdaConfig,
      entry: resolve("../src/backend/lambdas/lambda-3.ts"),
      functionName: `${applicationName}-lambda-3`,
      handler: "handler",
      environment: {
        TASK_TABLE_NAME: taskTable.tableName,
      },
    });

    taskTable.grantReadWriteData(this.lambda3);
  }
}
