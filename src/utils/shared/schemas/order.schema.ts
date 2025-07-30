export const getOrdersSchema = {
  security: [{ bearerAuth: [] }],
  querystring: {
    type: "object",
    properties: {
      order_id: { type: "string", pattern: "^[0-9]+$" },
      start_date: { type: "string", format: "date" },
      end_date: { type: "string", format: "date" },
      user_id: { type: "string", pattern: "^[0-9]+$" },
      page: { type: "string", pattern: "^[0-9]+$" },
      limit: { type: "string", pattern: "^[0-9]+$" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        orders: {
          type: "array",
          items: {
            type: "object",
            properties: {
              order_id: { type: "number" },
              purchase_date: { type: "string", format: "date-time" },
              total: { type: "number" },
              user: {
                type: "object",
                properties: {
                  user_id: { type: "number" },
                  name: { type: "string" },
                },
              },
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    product_id: { type: "number" },
                    value: { type: "number" },
                  },
                },
              },
            },
          },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
      },
    },
  },
};
