import { TaskRequest } from "./types";

export const handler = async (request: TaskRequest) => {
  const result = doLongRunningTask(request);
  return {
    result,
    statusCode: 200,
  };
};

const doLongRunningTask = (requestData: TaskRequest) => {
  return {
    task1: "result",
  };
};
