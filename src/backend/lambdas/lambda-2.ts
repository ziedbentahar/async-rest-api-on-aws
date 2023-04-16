import { Task2Input } from "./types";

type RequestData = {};

export const handler = async (request: Task2Input) => {
  const result = doLongRunningTask(request);
  return {
    result,
    statusCode: 200,
  };
};

const doLongRunningTask = (requestData: RequestData) => {
  return {
    task2: "result",
  };
};
