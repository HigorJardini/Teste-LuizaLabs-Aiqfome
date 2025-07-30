import {
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "@repositories-entities";
import { OrderFiltersDTO, OrderResponseDTO } from "@dtos";

export class GetOrdersUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private userRepository: UserRepository
  ) {}

  async execute(filters: OrderFiltersDTO): Promise<{
    orders: OrderResponseDTO[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const { orders, count } = await this.orderRepository.findAll({
      ...filters,
      page,
      limit,
    });

    const responseOrders: OrderResponseDTO[] = [];

    for (const order of orders) {
      const products = await this.productRepository.findByOrderId(
        order.order_id!
      );

      const user = await this.userRepository.findById(order.user_id);

      if (!user) {
        throw new Error(`User with id ${order.user_id} not found`);
      }

      responseOrders.push({
        order_id: order.order_id!,
        purchase_date: order.purchase_date,
        total: order.total,
        user: {
          user_id: user.user_id!,
          name: user.name,
        },
        products: products.map((p) => ({
          product_id: p.product_id!,
          value: p.value,
        })),
      });
    }

    return {
      orders: responseOrders,
      total: count,
      page,
      limit,
    };
  }
}
