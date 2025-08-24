export interface AddFavoriteDTO {
  productId: number;
}

export interface FavoriteProductResponseDTO {
  id: number;
  product_external_id: number;
  added_at: Date;
  product: ProductDTO;
}

export interface ProductDTO {
  id: number;
  title: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  rating?: {
    rate: number;
    count: number;
  };
}
