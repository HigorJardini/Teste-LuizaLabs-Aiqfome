export const updateUserSchema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2 },
      email: {
        type: "string",
        format: "email",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      },
    },
    minProperties: 1,
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        email: { type: "string" },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    },
    400: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    409: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["User"],
  description: "Update current user profile",
  security: [{ bearerAuth: [] }],
};
