export type OrderFiltersDTO = {
  order_id?: number;
  user_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
};

export type OrderResponseDTO = {
  id?: number;
  order_id: number;
  purchase_date?: Date;
  total?: number;
  user?: {
    user_id: number;
    name: string;
  };
  products?: {
    product_id: number;
    value: number;
  }[];
};
