export const uploadSchema = {
  consumes: ["multipart/form-data"],
  security: [{ bearerAuth: [] }],

  body: false,

  response: {
    201: {
      type: "object",
      properties: {
        upload_id: { type: "number" },
        filename: { type: "string" },
        uploaded_at: { type: "string", format: "date-time" },
        processed_records: { type: "number" },
      },
    },
    400: {
      type: "object",
      properties: {
        message: { type: "string" },
        error: { type: "string" },
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
