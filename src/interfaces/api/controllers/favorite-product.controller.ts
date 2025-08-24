import { FastifyRequest, FastifyReply } from "fastify";
import {
  AddFavoriteUseCase,
  RemoveFavoriteUseCase,
  GetUserFavoritesUseCase,
  GetFavoriteDetailsUseCase,
} from "@usecases";
import { AddFavoriteDTO } from "@dtos";

export interface FavoriteProductController {
  addFavorite(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  removeFavorite(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  getUserFavorites(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  getFavoriteProduct(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void>;
}

export class FavoriteProductControllerImpl
  implements FavoriteProductController
{
  constructor(
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
    private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    private readonly getFavoriteDetailsUseCase: GetFavoriteDetailsUseCase
  ) {}

  async addFavorite(
    request: FastifyRequest<{ Body: AddFavoriteDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const { productId } = request.body;

      const favorite = await this.addFavoriteUseCase.execute({
        userId,
        productId,
      });

      reply.code(201).send(favorite);
    } catch (error) {
      reply.code(400).send({
        message: (error as Error).message || "Failed to add favorite",
      });
    }
  }

  async removeFavorite(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const productId = parseInt(request.params.productId, 10);

      await this.removeFavoriteUseCase.execute({
        userId,
        productId,
      });

      reply.code(204).send();
    } catch (error) {
      reply.code(400).send({
        message: (error as Error).message || "Failed to remove favorite",
      });
    }
  }

  async getUserFavorites(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const favorites = await this.getUserFavoritesUseCase.execute(userId);

      reply.code(200).send(favorites);
    } catch (error) {
      reply.code(400).send({
        message: (error as Error).message || "Failed to fetch favorites",
      });
    }
  }

  async getFavoriteProduct(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const productId = parseInt(request.params.productId, 10);

      const product = await this.getFavoriteDetailsUseCase.execute({
        userId,
        productId,
      });

      reply.code(200).send(product);
    } catch (error) {
      reply.code(404).send({
        message: (error as Error).message || "Product not found in favorites",
      });
    }
  }
}
