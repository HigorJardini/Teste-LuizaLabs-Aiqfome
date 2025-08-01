import {
  OrderRepository,
  ProductRepository,
  UserRepository,
} from "@repositories-entities";
import { OrderFiltersDTO, OrderResponseDTO } from "@dtos";
import { ProductEntity } from "@entities";

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
      try {
        const products = await this.productRepository.findByOrderTableId(
          order.id!
        );

        const user = await this.userRepository.findByUserId(
          Number(order.user?.user_id),
          order.user?.name
        );

        if (!user) {
          console.warn(
            `User with internal id ${order.user_table_id} not found for order ${order.order_id}`
          );
          continue;
        }

        responseOrders.push({
          order_id: order.order_id!,
          purchase_date: order.purchase_date,
          total: order.total,
          user: {
            user_id: user.user_id!,
            name: user.name,
          },
          products: products.map((p: ProductEntity) => ({
            product_id: p.product_id!,
            value: p.value,
          })),
        });
      } catch (error) {
        console.error(`Error processing order ${order.order_id}:`, error);
      }
    }

    return {
      orders: responseOrders,
      total: count,
      page,
      limit,
    };
  }
}
