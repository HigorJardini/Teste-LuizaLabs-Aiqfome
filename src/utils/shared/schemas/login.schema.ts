export const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string" },
      password: { type: "string" },
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
            login_id: { type: "number" },
            username: { type: "string" },
            status: { type: "boolean" },
          },
        },
      },
    },
  },
};
