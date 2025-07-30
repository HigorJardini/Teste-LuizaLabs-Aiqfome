import { OrderEntity } from "@entities";
import { OrderFiltersDTO } from "@dtos";

export interface OrderRepository {
  create(order: OrderEntity): Promise<OrderEntity>;
  findById(order_id: number): Promise<OrderEntity | null>;
  findByIdAndUserId(
    order_id: number,
    user_id: number
  ): Promise<OrderEntity | null>;
  findAll(
    filters: OrderFiltersDTO
  ): Promise<{ orders: OrderEntity[]; count: number }>;
  createMany(orders: OrderEntity[]): Promise<OrderEntity[]>;
  modifyOrdersTable(): Promise<void>;
  updateTotal(order_id: number, total: number): Promise<void>;
}
