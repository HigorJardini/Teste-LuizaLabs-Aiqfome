export const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 6 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            email: { type: "string" },
            login_id: { type: "number" },
            username: { type: "string" },
            status: { type: "boolean" },
          },
        },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["Authentication"],
  description: "Login with username and password",
};
