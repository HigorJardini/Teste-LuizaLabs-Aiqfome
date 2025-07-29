export const registerSchema = {
  body: {
    type: "object",
    required: ["username", "password", "name"],
    properties: {
      username: { type: "string" },
      password: { type: "string", minLength: 6 },
      name: { type: "string" },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};
