import { ProductCacheRepository } from "@repositories-entities";
import { ProductCacheEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { ProductCache } from "@database-entities";
import { In } from "typeorm";

export class TypeORMProductCacheRepository implements ProductCacheRepository {
  private repository = AppDataSource.getRepository(ProductCache);

  async findById(productId: number): Promise<ProductCacheEntity | null> {
    const product = await this.repository.findOne({
      where: {
        product_external_id: productId,
      },
    });

    if (!product) {
      return null;
    }

    return {
      product_external_id: product.product_external_id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      description: product.description,
      category: product.category,
      rating_rate: product.rating_rate,
      rating_count: product.rating_count,
      last_updated: product.last_updated,
    };
  }

  async create(product: ProductCacheEntity): Promise<ProductCacheEntity> {
    const newProduct = this.repository.create(product);
    const savedProduct = await this.repository.save(newProduct);

    return {
      product_external_id: savedProduct.product_external_id,
      title: savedProduct.title,
      price: savedProduct.price,
      image_url: savedProduct.image_url,
      description: savedProduct.description,
      category: savedProduct.category,
      rating_rate: savedProduct.rating_rate,
      rating_count: savedProduct.rating_count,
      last_updated: savedProduct.last_updated,
    };
  }

  async update(
    productId: number,
    product: Partial<ProductCacheEntity>
  ): Promise<ProductCacheEntity> {
    await this.repository.update({ product_external_id: productId }, product);

    const updatedProduct = await this.repository.findOneOrFail({
      where: { product_external_id: productId },
    });

    return {
      product_external_id: updatedProduct.product_external_id,
      title: updatedProduct.title,
      price: updatedProduct.price,
      image_url: updatedProduct.image_url,
      description: updatedProduct.description,
      category: updatedProduct.category,
      rating_rate: updatedProduct.rating_rate,
      rating_count: updatedProduct.rating_count,
      last_updated: updatedProduct.last_updated,
    };
  }

  async findMultipleByIds(productIds: number[]): Promise<ProductCacheEntity[]> {
    const products = await this.repository.find({
      where: {
        product_external_id: In(productIds),
      },
    });

    return products.map((product) => ({
      product_external_id: product.product_external_id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      description: product.description,
      category: product.category,
      rating_rate: product.rating_rate,
      rating_count: product.rating_count,
      last_updated: product.last_updated,
    }));
  }
}
