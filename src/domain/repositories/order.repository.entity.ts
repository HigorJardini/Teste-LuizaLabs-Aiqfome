import { OrderEntity } from "@entities";
import { OrderFiltersDTO } from "@dtos";

export interface OrderRepository {
  create(order: OrderEntity): Promise<OrderEntity>;
  findById(id: number): Promise<OrderEntity | null>;
  findByOrderId(order_id: number): Promise<OrderEntity | null>;
  findByOrderIdAndUserTableId(
    order_id: number,
    user_table_id: number
  ): Promise<OrderEntity | null>;
  findAll(
    filters: OrderFiltersDTO
  ): Promise<{ orders: OrderEntity[]; count: number }>;
  createMany(orders: OrderEntity[]): Promise<OrderEntity[]>;
  modifyOrdersTable(): Promise<void>;
  updateTotal(id: number, total: number): Promise<void>;
}
