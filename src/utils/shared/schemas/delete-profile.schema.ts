export const deleteProfileSchema = {
  response: {
    204: {
      type: "null",
      description: "Account deleted successfully",
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["User"],
  description: "Delete current user account",
  security: [{ bearerAuth: [] }],
};
