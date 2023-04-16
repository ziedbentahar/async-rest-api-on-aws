export enum TaskStatus {
  InProgress = "InProgress",
  Error = "Error",
  Complete = "Complete",
}

export type TaskRequest = {
  id: string;
  requestData: string;
  responseCallbackUrl: string;
};

export type TaskResponse = {
  id: string;
  clientId: string;
  result: string;
  responseCallbackUrl: string;
};

export type Task2Input = TaskRequest & {
  task1Output: Task1Output;
};

export type Task3Input = TaskRequest & {
  task1Output: Task1Output;
} & {
  task2Output: Task2Output;
};

type Task1Output = {
  task1Result: Task1Result;
};

type Task1Result = {
  result: Result;
  statusCode: number;
};

type Result = {
  task1: string;
};

type Task2Output = {
  task2Result: Task2Result;
};

type Task2Result = {
  result: Result2;
  statusCode: number;
};

type Result2 = {
  task2: string;
};

type Task3Output = {
  task3Result: Task3Result;
};

type Task3Result = {
  result: Result3;
  statusCode: number;
};

type Result3 = {
  task3: string;
};
