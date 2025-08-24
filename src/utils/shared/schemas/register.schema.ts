export const registerSchema = {
  body: {
    type: "object",
    required: ["username", "password", "name", "email"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 6 },
      name: { type: "string", minLength: 2 },
      email: {
        type: "string",
        format: "email",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
        userId: { type: "number" },
        loginId: { type: "number" },
      },
    },
    409: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["Authentication"],
  description: "Register a new user",
};
