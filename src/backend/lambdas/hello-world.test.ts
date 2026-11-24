import { handler } from "./hello-world";

describe("hello-world handler", () => {
  it("should return a Hello World message with 200 status code", async () => {
    const result = await handler();

    expect(result.message).toBe("Hello World");
    expect(result.statusCode).toBe(200);
  });
});
