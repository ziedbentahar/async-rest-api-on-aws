export const handler = async (event: {
  methodArn: string;
  headers: { Authorization: string };
}) => {
  const { headers } = event;

  const { isTokenValid, principalId } = validateToken(headers.Authorization);

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

const validateToken = (
  token: string
): { isTokenValid: boolean; principalId: string } => {
  // TODO: do token validation
  return { isTokenValid: true, principalId: "42" };
};
