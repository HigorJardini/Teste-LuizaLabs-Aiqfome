import { ProductEntity } from "@entities";

export interface ProductRepository {
  create(product: ProductEntity): Promise<ProductEntity>;
  findByOrderId(order_id: number): Promise<ProductEntity[]>;
  createMany(products: ProductEntity[]): Promise<ProductEntity[]>;
}
