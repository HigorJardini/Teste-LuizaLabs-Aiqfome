import {
  FavoriteProductController,
  FavoriteProductControllerImpl,
} from "@controllers";
import {
  AddFavorite,
  RemoveFavorite,
  GetUserFavorites,
  GetFavoriteDetails,
  FetchExternalProduct,
} from "@usecases";
import {
  TypeORMFavoriteProductRepository,
  TypeORMProductCacheRepository,
} from "@database-repositories";

export class FavoriteProductFactory {
  static makeFavoriteProductController(): FavoriteProductController {
    const favoriteRepository = new TypeORMFavoriteProductRepository();
    const productCacheRepository = new TypeORMProductCacheRepository();

    const fetchExternalProduct = new FetchExternalProduct(
      productCacheRepository
    );

    const addFavoriteUseCase = new AddFavorite(
      favoriteRepository,
      productCacheRepository,
      fetchExternalProduct
    );

    const removeFavoriteUseCase = new RemoveFavorite(favoriteRepository);
    const getUserFavoritesUseCase = new GetUserFavorites(
      favoriteRepository,
      productCacheRepository
    );
    const getFavoriteDetailsUseCase = new GetFavoriteDetails(
      favoriteRepository,
      productCacheRepository
    );

    return new FavoriteProductControllerImpl(
      addFavoriteUseCase,
      removeFavoriteUseCase,
      getUserFavoritesUseCase,
      getFavoriteDetailsUseCase
    );
  }
}
