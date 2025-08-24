import { FavoriteProductRepository } from "@repositories-entities";

export interface RemoveFavoriteInput {
  userId: number;
  productId: number;
}

export interface RemoveFavoriteUseCase {
  execute(input: RemoveFavoriteInput): Promise<boolean>;
}

export class RemoveFavorite implements RemoveFavoriteUseCase {
  constructor(private readonly favoriteRepository: FavoriteProductRepository) {}

  async execute(input: RemoveFavoriteInput): Promise<boolean> {
    const { userId, productId } = input;

    const favorite = await this.favoriteRepository.findByUserIdAndProductId(
      userId,
      productId
    );
    if (!favorite) {
      throw new Error("Product not in favorites");
    }

    return this.favoriteRepository.delete(userId, productId);
  }
}
