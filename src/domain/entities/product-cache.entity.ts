export interface ProductCacheEntity {
  product_external_id: number;
  title: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  rating_rate?: number;
  rating_count?: number;
  last_updated?: Date;
}
