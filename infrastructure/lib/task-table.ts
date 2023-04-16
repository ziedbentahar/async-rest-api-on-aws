import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

interface TaskTableProps {
  applicationName: string;
}

export class TaskTable extends Construct {
  table: Table;

  constructor(scope: Construct, id: string, props?: TaskTableProps) {
    super(scope, id);

    const { applicationName } = props!;

    const tableName = `${applicationName}-db`;

    this.table = new Table(this, tableName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: `id`,
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      tableName,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
  }
}
