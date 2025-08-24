export const addFavoriteSchema = {
  body: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "number", minimum: 1 },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "number" },
        user_id: { type: "number" },
        product_external_id: { type: "number" },
        added_at: { type: "string", format: "date-time" },
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
    404: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["Favorites"],
  description: "Add a product to favorites",
  security: [{ bearerAuth: [] }],
};

export const removeFavoriteSchema = {
  params: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "string" },
    },
  },
  response: {
    204: {
      type: "null",
      description: "Product removed from favorites",
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
    404: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["Favorites"],
  description: "Remove a product from favorites",
  security: [{ bearerAuth: [] }],
};

export const getUserFavoritesSchema = {
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          product_external_id: { type: "number" },
          added_at: { type: "string", format: "date-time" },
          product: {
            type: "object",
            properties: {
              product_external_id: { type: "number" },
              title: { type: "string" },
              price: { type: "number" },
              image_url: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              rating_rate: { type: "number" },
              rating_count: { type: "number" },
            },
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
  tags: ["Favorites"],
  description: "Get all favorite products for the current user",
  security: [{ bearerAuth: [] }],
};

export const getFavoriteProductSchema = {
  params: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        product_external_id: { type: "number" },
        title: { type: "string" },
        price: { type: "number" },
        image_url: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        rating_rate: { type: "number" },
        rating_count: { type: "number" },
      },
    },
    401: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
  tags: ["Favorites"],
  description: "Get details for a specific favorite product",
  security: [{ bearerAuth: [] }],
};
