import { ProductEntity } from "./product.entity";

export type OrderEntity = {
  id?: number;
  order_id: number;
  purchase_date: Date;
  total: number;
  user_table_id: number;
  upload_id: number;
  user?: {
    id?: number;
    user_id: number;
    name: string;
  };
  products?: ProductEntity[];
};
