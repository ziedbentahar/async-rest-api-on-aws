import {
  AwsIntegration,
  IdentitySource,
  PassthroughBehavior,
  RequestAuthorizer,
  Resource,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayProps {
  applicationName: string;
  destinationTable: Table;
  authorizers: {
    createTask: IFunction;
    getStatus: IFunction;
  };
}

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string, props?: ApiGatewayProps) {
    super(scope, id);

    const {
      applicationName,
      destinationTable,
      authorizers: { createTask, getStatus },
    } = props!;

    const apigatewayName = `${applicationName}-apigateway`;

    var api = new RestApi(this, "restapi", {
      restApiName: apigatewayName,
      deploy: true,
    });

    const resource = api.root.addResource("task");

    this.addPostMethodIntegration(createTask, destinationTable, resource);
    this.addGetMethodIntegration(getStatus, destinationTable, resource);
  }

  private addPostMethodIntegration(
    startTaskAuthorizer: IFunction,
    destinationTable: Table,
    resource: Resource
  ) {
    const role = new Role(this, "apigtw-write-ddb", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    destinationTable.grantWriteData(role);

    const authorizer = new RequestAuthorizer(this, `create-task-authorizer`, {
      handler: startTaskAuthorizer,
      identitySources: [
        IdentitySource.header("authorization"),
        IdentitySource.header("callback"),
      ],
    });

    const dynamoPutIntegration = new AwsIntegration({
      service: "dynamodb",
      action: "PutItem",
      options: {
        passthroughBehavior: PassthroughBehavior.NEVER,
        credentialsRole: role,
        requestTemplates: {
          "application/json": JSON.stringify({
            TableName: destinationTable.tableName,
            Item: {
              id: { S: "$context.requestId" },
              clientId: { S: "$context.authorizer.principalId" },
              requestData: { S: "$input.path('$.data')" },
              responseCallbackUrl: {
                S: "$util.escapeJavaScript($input.params('callback'))",
              },
            },
          }),
        },
        integrationResponses: [
          {
            selectionPattern: "200",
            statusCode: "202",
            responseTemplates: {
              "application/json": JSON.stringify({
                task: {
                  id: "$context.requestId",
                  href: `$context.path/$context.requestId`,
                },
              }),
            },
          },
        ],
      },
    });

    resource.addMethod("POST", dynamoPutIntegration, {
      methodResponses: [
        {
          statusCode: "202",
        },
      ],
      authorizer,
    });
  }

  private addGetMethodIntegration(
    getStatusAuthorizer: IFunction,
    destinationTable: Table,
    resource: Resource
  ) {
    const role = new Role(this, "apigtw-read-ddb", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    destinationTable.grantReadData(role);

    const authorizer = new RequestAuthorizer(this, `get-status-authorizer`, {
      handler: getStatusAuthorizer,
      identitySources: [IdentitySource.header("authorization")],
    });

    const dynamoQueryIntegration = new AwsIntegration({
      service: "dynamodb",
      action: "Query",
      options: {
        passthroughBehavior: PassthroughBehavior.NEVER,
        credentialsRole: role,
        requestTemplates: {
          "application/json": JSON.stringify({
            TableName: destinationTable.tableName,
            KeyConditionExpression: "id = :pk",
            ExpressionAttributeValues: {
              ":pk": { S: "$input.params('id')" },
            },
          }),
        },

        integrationResponses: [
          {
            selectionPattern: "400",
            statusCode: "400",
            responseTemplates: {
              "application/json": JSON.stringify({ error: "Bad input" }),
            },
          },
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": JSON.stringify({
                id: "$input.path('$.Items[0].id.S')",
                status: "$input.path('$.Items[0].taskStatus.S')",
              }),
            },
          },
        ],
      },
    });

    resource.addResource("{id}").addMethod("GET", dynamoQueryIntegration, {
      methodResponses: [{ statusCode: "200" }],
      authorizer,
    });
  }
}
