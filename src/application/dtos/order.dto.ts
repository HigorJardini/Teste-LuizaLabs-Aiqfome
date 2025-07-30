export interface OrderFiltersDTO {
  order_id?: number;
  start_date?: string;
  end_date?: string;
  user_id?: number;
  page?: number;
  limit?: number;
}

export interface OrderResponseDTO {
  order_id: number;
  purchase_date: Date;
  total: number;
  user: {
    user_id: number;
    name: string;
  };
  products: {
    product_id: number;
    value: number;
  }[];
}
