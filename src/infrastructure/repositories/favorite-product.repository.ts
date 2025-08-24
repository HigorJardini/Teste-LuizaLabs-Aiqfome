import { FavoriteProductRepository } from "@repositories-entities";
import { FavoriteProductEntity } from "@entities";
import { AppDataSource } from "@database-connection";
import { FavoriteProduct } from "@database-entities";

export class TypeORMFavoriteProductRepository
  implements FavoriteProductRepository
{
  private repository = AppDataSource.getRepository(FavoriteProduct);

  async findByUserIdAndProductId(
    userId: number,
    productId: number
  ): Promise<FavoriteProductEntity | null> {
    const favorite = await this.repository.findOne({
      where: {
        user_id: userId,
        product_external_id: productId,
      },
    });

    if (!favorite) {
      return null;
    }

    return {
      id: favorite.id,
      user_id: favorite.user_id,
      product_external_id: favorite.product_external_id,
      added_at: favorite.added_at,
    };
  }

  async findAllByUserId(userId: number): Promise<FavoriteProductEntity[]> {
    const favorites = await this.repository.find({
      where: {
        user_id: userId,
      },
    });

    return favorites.map((favorite) => ({
      id: favorite.id,
      user_id: favorite.user_id,
      product_external_id: favorite.product_external_id,
      added_at: favorite.added_at,
    }));
  }

  async create(
    favorite: FavoriteProductEntity
  ): Promise<FavoriteProductEntity> {
    const newFavorite = this.repository.create(favorite);
    const savedFavorite = await this.repository.save(newFavorite);

    return {
      id: savedFavorite.id,
      user_id: savedFavorite.user_id,
      product_external_id: savedFavorite.product_external_id,
      added_at: savedFavorite.added_at,
    };
  }

  async delete(userId: number, productId: number): Promise<boolean> {
    const result = await this.repository.delete({
      user_id: userId,
      product_external_id: productId,
    });

    return result.affected != null && result.affected > 0;
  }
}
