import { FastifyInstance } from "fastify";
import { FavoriteProductFactory } from "@factories";
import {
  addFavoriteSchema,
  removeFavoriteSchema,
  getUserFavoritesSchema,
  getFavoriteProductSchema,
} from "@schemas";
import { AddFavoriteDTO } from "@dtos";
import { authenticate } from "@middlewares";

export async function favoriteProductRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const favoriteProductController =
    FavoriteProductFactory.makeFavoriteProductController();

  fastify.get(
    "/favorites",
    {
      preHandler: authenticate,
      schema: getUserFavoritesSchema,
    },
    (request, reply) =>
      favoriteProductController.getUserFavorites(request, reply)
  );

  fastify.post<{
    Body: AddFavoriteDTO;
  }>(
    "/favorites",
    {
      preHandler: authenticate,
      schema: addFavoriteSchema,
    },
    (request, reply) => favoriteProductController.addFavorite(request, reply)
  );

  fastify.delete(
    "/favorites/:productId",
    {
      preHandler: authenticate,
      schema: removeFavoriteSchema,
    },
    (request, reply) => favoriteProductController.removeFavorite(request, reply)
  );

  fastify.get(
    "/favorites/:productId",
    {
      preHandler: authenticate,
      schema: getFavoriteProductSchema,
    },
    (request, reply) =>
      favoriteProductController.getFavoriteProduct(request, reply)
  );
}
