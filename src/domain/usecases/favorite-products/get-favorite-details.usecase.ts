import { ProductCacheEntity } from "@entities";
import {
  FavoriteProductRepository,
  ProductCacheRepository,
} from "@repositories-entities";

export interface GetFavoriteDetailsInput {
  userId: number;
  productId: number;
}

export interface GetFavoriteDetailsUseCase {
  execute(input: GetFavoriteDetailsInput): Promise<ProductCacheEntity>;
}

export class GetFavoriteDetails implements GetFavoriteDetailsUseCase {
  constructor(
    private readonly favoriteRepository: FavoriteProductRepository,
    private readonly productCacheRepository: ProductCacheRepository
  ) {}

  async execute(input: GetFavoriteDetailsInput): Promise<ProductCacheEntity> {
    const { userId, productId } = input;

    const favorite = await this.favoriteRepository.findByUserIdAndProductId(
      userId,
      productId
    );
    if (!favorite) {
      throw new Error("Product not in favorites");
    }

    const product = await this.productCacheRepository.findById(productId);
    if (!product) {
      throw new Error("Product details not found");
    }

    return product;
  }
}
