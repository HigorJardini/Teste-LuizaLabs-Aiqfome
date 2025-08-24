import { FavoriteProductEntity } from "@entities";
import {
  FavoriteProductRepository,
  ProductCacheRepository,
} from "@repositories-entities";
import { FetchExternalProduct } from "@usecases";

export interface AddFavoriteInput {
  userId: number;
  productId: number;
}

export interface AddFavoriteUseCase {
  execute(input: AddFavoriteInput): Promise<FavoriteProductEntity>;
}

export class AddFavorite implements AddFavoriteUseCase {
  constructor(
    private readonly favoriteRepository: FavoriteProductRepository,
    private readonly productCacheRepository: ProductCacheRepository,
    private readonly fetchExternalProduct: FetchExternalProduct
  ) {}

  async execute(input: AddFavoriteInput): Promise<FavoriteProductEntity> {
    const { userId, productId } = input;

    const existing = await this.favoriteRepository.findByUserIdAndProductId(
      userId,
      productId
    );
    if (existing) {
      throw new Error("Product already in favorites");
    }

    let product = await this.productCacheRepository.findById(productId);
    if (!product) {
      product = await this.fetchExternalProduct.execute(productId);
    }

    return this.favoriteRepository.create({
      user_id: userId,
      product_external_id: productId,
    });
  }
}
