import { ProductRepository } from "@repositories-entities";
import { ProductEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { ProductTypeORMEntity } from "@database-entities";

export class TypeORMProductRepository implements ProductRepository {
  private repository = AppDataSource.getRepository(ProductTypeORMEntity);

  async findByOrderId(order_id: number): Promise<ProductEntity[]> {
    try {
      const products = await this.repository.find({
        where: { order_table_id: order_id },
      });

      return products.map((p) => ({
        id: p.id,
        product_id: p.product_id!,
        value: p.value!,
        order_table_id: p.order_table_id,
      }));
    } catch (error) {
      console.error(`Error finding products for order ID ${order_id}:`, error);
      return [];
    }
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    try {
      const newProduct = this.repository.create({
        product_id: product.product_id,
        value: product.value,
        order_table_id: product.order_table_id,
      });

      const savedProduct = await this.repository.save(newProduct);
      console.log(
        `Created product with internal ID ${savedProduct.id}, business product_id ${savedProduct.product_id} for order table ID ${product.order_table_id}`
      );

      return {
        id: savedProduct.id,
        product_id: savedProduct.product_id!,
        value: savedProduct.value!,
        order_table_id: savedProduct.order_table_id,
      };
    } catch (error) {
      console.error(
        `Error creating product for order table ID ${product.order_table_id}:`,
        error
      );
      throw error;
    }
  }

  async findByOrderTableId(order_table_id: number): Promise<ProductEntity[]> {
    try {
      const products = await this.repository.find({
        where: { order_table_id },
      });

      return products.map((p) => ({
        id: p.id,
        product_id: p.product_id!,
        value: p.value!,
        order_table_id: p.order_table_id,
      }));
    } catch (error) {
      console.error(
        `Error finding products for order table ID ${order_table_id}:`,
        error
      );
      return [];
    }
  }

  async createMany(products: ProductEntity[]): Promise<ProductEntity[]> {
    const results: ProductEntity[] = [];

    for (const product of products) {
      try {
        const savedProduct = await this.create(product);
        results.push(savedProduct);
      } catch (error) {
        console.error(
          `Error creating product ${product.product_id} for order table ID ${product.order_table_id}:`,
          error
        );
      }
    }

    return results;
  }
}
