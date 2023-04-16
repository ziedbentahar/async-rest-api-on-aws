import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  Chain,
  IStateMachine,
  JsonPath,
  LogLevel,
  Pass,
  StateMachine,
} from "aws-cdk-lib/aws-stepfunctions";
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
  LambdaInvoke,
} from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";

interface StateMachineProps {
  applicationName: string;
  lambda1: IFunction;
  lambda2: IFunction;
  lambda3: IFunction;
  table: ITable;
}

export class LongRunningTaskStateMachine extends Construct {
  readonly stateMachine: IStateMachine;

  constructor(scope: Construct, id: string, props?: StateMachineProps) {
    super(scope, id);

    const { applicationName, lambda1, lambda2, lambda3, table } = props!;

    const definition = Chain.start(
      new Pass(this, "unwarp-request", { inputPath: "$.[0]" })
        .next(
          new DynamoUpdateItem(this, "update-initial-task-status", {
            table,
            key: {
              id: DynamoAttributeValue.fromString(JsonPath.stringAt("$.id")),
            },
            expressionAttributeValues: {
              ":val": DynamoAttributeValue.fromString("InProgress"),
            },
            updateExpression: "SET taskStatus = :val",
            resultPath: JsonPath.DISCARD,
          })
        )
        .next(
          new LambdaInvoke(this, "long-running-task-1", {
            lambdaFunction: lambda1,
            retryOnServiceExceptions: true,
            resultSelector: {
              "task1Result.$": "$.Payload",
            },
            resultPath: "$.task1Output",
          })
        )
        .next(
          new LambdaInvoke(this, "long-running-task-2", {
            lambdaFunction: lambda2,
            retryOnServiceExceptions: true,
            resultSelector: {
              "task2Result.$": "$.Payload",
            },
            resultPath: "$.task2Output",
          })
        )
        .next(
          new LambdaInvoke(this, "long-running-task-3", {
            lambdaFunction: lambda3,
            retryOnServiceExceptions: true,
            resultSelector: {
              "task3Result.$": "$.Payload",
            },
            resultPath: "$.task3Output",
          })
        )
        .next(
          new DynamoUpdateItem(this, "update-final-task-status", {
            table,
            key: {
              id: DynamoAttributeValue.fromString(JsonPath.stringAt("$.id")),
            },
            expressionAttributeValues: {
              ":result": DynamoAttributeValue.fromString(
                JsonPath.jsonToString(
                  JsonPath.objectAt("$.task3Output.task3Result.result")
                )
              ),
              ":status": DynamoAttributeValue.fromString("Complete"),
            },
            updateExpression: "SET taskResult = :result, taskStatus = :status",
            resultPath: JsonPath.DISCARD,
          })
        )
    );

    this.stateMachine = new StateMachine(
      this,
      `${applicationName}-state-machine`,
      {
        definition,
        logs: {
          destination: new LogGroup(this, "step-function-log-group", {
            retention: RetentionDays.THREE_DAYS,
          }),
          level: LogLevel.ERROR,
        },
      }
    );
  }
}
