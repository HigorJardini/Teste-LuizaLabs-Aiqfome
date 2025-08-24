export const getProfileSchema = {
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
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["User"],
  description: "Get current user profile",
  security: [{ bearerAuth: [] }],
};
