import { FavoriteProductEntity, ProductCacheEntity } from "@entities";
import {
  FavoriteProductRepository,
  ProductCacheRepository,
} from "@repositories-entities";

export interface FavoriteProductWithDetails extends FavoriteProductEntity {
  product: ProductCacheEntity;
}

export interface GetUserFavoritesUseCase {
  execute(userId: number): Promise<FavoriteProductWithDetails[]>;
}

export class GetUserFavorites implements GetUserFavoritesUseCase {
  constructor(
    private readonly favoriteRepository: FavoriteProductRepository,
    private readonly productCacheRepository: ProductCacheRepository
  ) {}

  async execute(userId: number): Promise<FavoriteProductWithDetails[]> {
    const favorites = await this.favoriteRepository.findAllByUserId(userId);

    if (favorites.length === 0) {
      return [];
    }

    const productIds = favorites.map((fav) => fav.product_external_id);

    const products =
      await this.productCacheRepository.findMultipleByIds(productIds);

    const productMap = new Map<number, ProductCacheEntity>();
    products.forEach((product) => {
      productMap.set(product.product_external_id, product);
    });

    return favorites.map((favorite) => {
      return {
        ...favorite,
        product: productMap.get(favorite.product_external_id)!,
      };
    });
  }
}
