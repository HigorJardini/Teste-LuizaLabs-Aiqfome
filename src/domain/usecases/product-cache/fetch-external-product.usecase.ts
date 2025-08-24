import { ProductCacheEntity } from "@entities";
import { ProductCacheRepository } from "@repositories-entities";
import axios from "axios";

export interface FetchExternalProductUseCase {
  execute(productId: number): Promise<ProductCacheEntity>;
}

export class FetchExternalProduct implements FetchExternalProductUseCase {
  constructor(
    private readonly productCacheRepository: ProductCacheRepository
  ) {}

  async execute(productId: number): Promise<ProductCacheEntity> {
    try {
      const cachedProduct =
        await this.productCacheRepository.findById(productId);
      if (cachedProduct) {
        return cachedProduct;
      }

      const response = await axios.get(
        `https://fakestoreapi.com/products/${productId}`
      );
      const product = response.data;

      const productCache: ProductCacheEntity = {
        product_external_id: product.id,
        title: product.title,
        price: product.price,
        image_url: product.image,
        description: product.description,
        category: product.category,
        rating_rate: product.rating?.rate,
        rating_count: product.rating?.count,
        last_updated: new Date(),
      };

      return this.productCacheRepository.create(productCache);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      throw new Error("Failed to fetch product.");
    }
  }
}
