import { ProductRepository } from "@repositories-entities";
import { ProductEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { ProductTypeORMEntity } from "@database-entities";

export class TypeORMProductRepository implements ProductRepository {
  private repository = AppDataSource.getRepository(ProductTypeORMEntity);

  async create(product: ProductEntity): Promise<ProductEntity> {
    try {
      const newProduct = this.repository.create({
        value: product.value,
        order_id: product.order_id,
      });

      const savedProduct = await this.repository.save(newProduct);
      console.log(
        `Created product with generated ID ${savedProduct.product_id} for order ${product.order_id}`
      );

      return {
        product_id: savedProduct.product_id,
        value: savedProduct.value ?? 0,
        order_id: savedProduct.order_id ?? 0,
      };
    } catch (error) {
      console.error(
        `Error creating product for order ${product.order_id}:`,
        error
      );
      throw error;
    }
  }

  async createMany(products: ProductEntity[]): Promise<ProductEntity[]> {
    console.log(`Creating ${products.length} products individually`);
    const results: ProductEntity[] = [];

    for (const product of products) {
      try {
        const savedProduct = await this.create(product);
        results.push(savedProduct);
      } catch (error) {
        console.error(
          `Error creating product for order ${product.order_id}:`,
          error
        );
      }
    }

    return results;
  }

  async findByOrderId(order_id: number): Promise<ProductEntity[]> {
    try {
      const products = await this.repository.find({ where: { order_id } });
      return products.map((p) => ({
        product_id: p.product_id ?? 0,
        value: p.value ?? 0,
        order_id: p.order_id ?? 0,
      }));
    } catch (error) {
      console.error(`Error finding products for order ${order_id}:`, error);
      return [];
    }
  }
}
