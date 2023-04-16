import fetch from "node-fetch";
import { TaskResponse } from "./types";
import crypto = require("crypto");

export const handler = async (event: { detail: TaskResponse }) => {
  const { responseCallbackUrl, clientId, ...responsePayload } = event.detail;

  const stringifiedResponsePayload = JSON.stringify(responsePayload);

  const response = await fetch(event.detail.responseCallbackUrl, {
    method: "POST",
    headers: {
      "X-Hmac-SHA256": await computeHMAC(stringifiedResponsePayload, clientId),
    },
    body: stringifiedResponsePayload,
  });

  if (!response.ok) {
    throw new Error(
      `Error occured while calling back ${event.detail.responseCallbackUrl}. Responses status was ${response.status}`
    );
  }

  return {
    status: 200,
  };
};

const computeHMAC = async (data: string, clientId: string) => {
  const key = await getKeyForClientId(clientId);
  return crypto.createHmac("sha256", key).update(data).digest("hex");
};

const getKeyForClientId = async (clientId: string): Promise<string> => {
  // TODO: get key for client from a reemote & secure repo
  return Promise.resolve("42");
};
