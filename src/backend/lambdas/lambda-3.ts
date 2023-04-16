import { Task3Input } from "./types";

export const handler = async (request: Task3Input) => {
  const result = doLongRunningTask(request);

  return {
    statusCode: 200,
    id: request.id,
    result,
  };
};

const doLongRunningTask = (taskInput: Task3Input) => {
  //do something with request data

  return {
    final: "result",
  };
};
