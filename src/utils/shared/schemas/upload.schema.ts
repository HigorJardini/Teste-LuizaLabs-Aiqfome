export const uploadSchema = {
  consumes: ["multipart/form-data"],
  security: [{ bearerAuth: [] }],

  body: false,

  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
        processed: { type: "number" },
        errors: { type: "number" },
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              upload_id: { type: "number" },
              filename: { type: "string" },
              uploaded_at: { type: "string", format: "date-time" },
              processed_records: { type: "number" },
            },
          },
        },
      },
    },
    400: {
      type: "object",
      properties: {
        message: { type: "string" },
        processed: { type: "number" },
        errors: { type: "number" },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};
