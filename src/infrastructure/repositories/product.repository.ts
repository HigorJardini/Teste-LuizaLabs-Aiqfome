import { ProductRepository } from "@repositories-entities";
import { ProductEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { ProductTypeORMEntity } from "@database-entities";

export class TypeORMProductRepository implements ProductRepository {
  private repository = AppDataSource.getRepository(ProductTypeORMEntity);

  async create(product: ProductEntity): Promise<ProductEntity> {
    const newProduct = this.repository.create(product);
    const savedProduct = await this.repository.save(newProduct);

    return {
      product_id: savedProduct.product_id,
      value: savedProduct.value ?? 0,
      order_id: savedProduct.order_id ?? 0,
    };
  }

  async findByOrderId(order_id: number): Promise<ProductEntity[]> {
    const products = await this.repository.find({ where: { order_id } });

    return products.map((product) => ({
      product_id: product.product_id,
      value: product.value ?? 0,
      order_id: product.order_id ?? 0,
    }));
  }

  async createMany(products: ProductEntity[]): Promise<ProductEntity[]> {
    const createdProducts = this.repository.create(products);
    const savedProducts = await this.repository.save(createdProducts);

    return savedProducts.map((product) => ({
      product_id: product.product_id ?? 0,
      value: product.value ?? 0,
      order_id: product.order_id ?? 0,
    }));
  }
}
