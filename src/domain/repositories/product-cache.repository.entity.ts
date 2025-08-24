import { ProductCacheEntity } from "@entities";

export interface ProductCacheRepository {
  findById(productId: number): Promise<ProductCacheEntity | null>;
  create(product: ProductCacheEntity): Promise<ProductCacheEntity>;
  update(
    productId: number,
    product: Partial<ProductCacheEntity>
  ): Promise<ProductCacheEntity>;
  findMultipleByIds(productIds: number[]): Promise<ProductCacheEntity[]>;
}
