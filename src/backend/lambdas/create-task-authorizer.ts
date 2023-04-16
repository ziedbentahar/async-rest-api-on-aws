export const handler = async (event: {
  methodArn: string;
  headers: { token: string; callback: string };
}) => {
  const { headers } = event;

  const { isTokenValid, principalId } = validateTokenWithCallbackUrl(
    headers.token,
    headers.callback
  );

  return {
    principalId: isTokenValid ? principalId : undefined,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: isTokenValid ? "Allow" : "Deny",
          Resource: event.methodArn,
        },
      ],
    },
  };
};

const validateTokenWithCallbackUrl = (
  token: string,
  callback: string
): { isTokenValid: boolean; principalId: string } => {
  // TODO: do token with callback validation
  return { isTokenValid: true, principalId: "42" };
};
