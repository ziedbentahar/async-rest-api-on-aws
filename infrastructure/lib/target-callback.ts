import { Duration } from "aws-cdk-lib";
import { EventBus, IEventBus, Match, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
const resolve = require("path").resolve;

interface TargetCallbackProps {
  applicationName: string;
}

export class TargetCallback extends Construct {
  readonly eventBus: IEventBus;

  constructor(scope: Construct, id: string, props?: TargetCallbackProps) {
    super(scope, id);

    const { applicationName } = props!;

    this.eventBus = new EventBus(this, EventBus.name);

    const deadLetterQueue = new Queue(this, Queue.name, {
      queueName: `${applicationName}-webhook-dlq`,
    });

    const webhookLambda = new NodejsFunction(
      this,
      `applicationName-webhook-lambda`,
      {
        memorySize: 128,
        timeout: Duration.seconds(10),
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
        entry: resolve("../src/backend/lambdas/callback-lambda.ts"),
        functionName: `${applicationName}-webhook-lambda`,
        handler: "handler",
      }
    );

    new Rule(this, Rule.name, {
      eventBus: this.eventBus,
      eventPattern: {
        source: Match.prefix(""),
      },
      targets: [
        new LambdaFunction(webhookLambda, {
          retryAttempts: 10,
          deadLetterQueue,
        }),
      ],
    });
  }
}
