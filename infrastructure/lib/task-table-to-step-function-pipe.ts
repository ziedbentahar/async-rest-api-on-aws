import { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

interface TaskTableToStepFunctionPipeProps {
  applicationName: string;
  targetStepFunction: IStateMachine;
  soureTable: ITable;
}

export class TaskTableToStepFunctionPipe extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props?: TaskTableToStepFunctionPipeProps
  ) {
    super(scope, id);

    const { applicationName, targetStepFunction, soureTable } = props!;

    const pipeName = `${applicationName}-tasktable-to-stepfunction-pipe`;

    const targetPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          resources: [targetStepFunction.stateMachineArn],
          actions: ["states:StartExecution"],
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

    new CfnPipe(this, "taskTableToStepFunctionPipe", {
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
              pattern: JSON.stringify({ eventName: ["INSERT"] }),
            },
          ],
        },
      },
      target: targetStepFunction.stateMachineArn,

      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: "FIRE_AND_FORGET",
        },
        inputTemplate: `{
          "id": <$.dynamodb.NewImage.id.S>,
          "requestData": <$.dynamodb.NewImage.requestData.S>,
          "responseCallbackUrl": <$.dynamodb.NewImage.responseCallbackUrl.S>
        }`,
      },
    });
  }
}
