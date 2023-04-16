import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiGateway } from "./api-gateway";
import { LongRunningTasksLambdas } from "./long-running-task-lambdas";
import { RequestAuthorizersLambdas } from "./request-authorizers-lambdas";
import { LongRunningTaskStateMachine } from "./state-machine";
import { TargetCallback } from "./target-callback";
import { TaskTable } from "./task-table";
import { TaskTableToApiEventBusPipe } from "./task-table-to-event-bus-pipe";
import { TaskTableToStepFunctionPipe } from "./task-table-to-step-function-pipe";

export class AsyncRestApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const applicationName = "async-rest-api";

    const { table } = new TaskTable(this, "task-table", {
      applicationName,
    });

    const lambdas = new LongRunningTasksLambdas(this, "lambdas", {
      applicationName,
      taskTable: table,
    });

    const { stateMachine } = new LongRunningTaskStateMachine(
      this,
      "state-machine",
      {
        applicationName,
        lambda1: lambdas.lambda1,
        lambda2: lambdas.lambda2,
        lambda3: lambdas.lambda3,
        table,
      }
    );

    const { checkTaskStatusAuthorizer, createTaskAuthorizer } =
      new RequestAuthorizersLambdas(this, RequestAuthorizersLambdas.name, {
        applicationName,
      });

    const apiGateway = new ApiGateway(this, "apigateway", {
      applicationName,
      destinationTable: table,
      authorizers: {
        createTask: createTaskAuthorizer,
        getStatus: checkTaskStatusAuthorizer,
      },
    });

    const { eventBus } = new TargetCallback(this, TargetCallback.name, {
      applicationName,
    });

    new TaskTableToStepFunctionPipe(this, TaskTableToStepFunctionPipe.name, {
      applicationName,
      soureTable: table,
      targetStepFunction: stateMachine,
    });

    new TaskTableToApiEventBusPipe(this, TaskTableToApiEventBusPipe.name, {
      applicationName,
      soureTable: table,
      targetEventBus: eventBus,
    });
  }
}
