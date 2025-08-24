import { FavoriteProductEntity } from "@entities";

export interface FavoriteProductRepository {
  findByUserIdAndProductId(
    userId: number,
    productId: number
  ): Promise<FavoriteProductEntity | null>;
  findAllByUserId(userId: number): Promise<FavoriteProductEntity[]>;
  create(favorite: FavoriteProductEntity): Promise<FavoriteProductEntity>;
  delete(userId: number, productId: number): Promise<boolean>;
}
