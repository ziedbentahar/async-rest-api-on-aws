import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IEventBus } from "aws-cdk-lib/aws-events";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { Construct } from "constructs";

interface TaskTableToApiDestinationPipeProps {
  applicationName: string;
  targetEventBus: IEventBus;
  soureTable: ITable;
}

export class TaskTableToApiEventBusPipe extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props?: TaskTableToApiDestinationPipeProps
  ) {
    super(scope, id);

    const {
      applicationName,
      targetEventBus: targetEventBus,
      soureTable,
    } = props!;

    const pipeName = `${applicationName}-tasktable-to-eventbus-pipe`;

    const targetPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [targetEventBus.eventBusArn],
          actions: ["events:PutEvents"],
          effect: Effect.ALLOW,
        }),
      ],
    });

    const sourcePolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [soureTable.tableStreamArn!],
          actions: [
            "dynamodb:DescribeStream",
            "dynamodb:GetRecords",
            "dynamodb:GetShardIterator",
            "dynamodb:ListStreams",
          ],
          effect: Effect.ALLOW,
        }),
      ],
    });

    const pipeRole = new Role(this, "role", {
      assumedBy: new ServicePrincipal("pipes.amazonaws.com"),
      inlinePolicies: {
        sourcePolicy,
        targetPolicy,
      },
    });

    const pipe = new CfnPipe(this, "taskTableToEventBusPipe", {
      name: pipeName,
      roleArn: pipeRole.roleArn,
      source: soureTable.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: "LATEST",
        },
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify({
                dynamodb: { NewImage: { taskStatus: { S: ["Complete"] } } },
                eventName: ["MODIFY"],
              }),
            },
          ],
        },
      },

      target: targetEventBus.eventBusArn,
      targetParameters: {
        inputTemplate: `{
          "id": <$.dynamodb.NewImage.id.S>,
          "clientId": <$.dynamodb.NewImage.clientId.S>,
          "result": <$.dynamodb.NewImage.taskResult.S>,
          "responseCallbackUrl": <$.dynamodb.NewImage.responseCallbackUrl.S>
        }`,
      },
    });
  }
}
