import { OrderController } from "@controllers";
import { GetOrdersUseCase } from "@usecases";
import {
  TypeORMOrderRepository,
  TypeORMProductRepository,
  TypeORMUserRepository,
} from "@database-repositories";

export function makeOrderController(): OrderController {
  const orderRepository = new TypeORMOrderRepository();
  const productRepository = new TypeORMProductRepository();
  const userRepository = new TypeORMUserRepository();

  const getOrdersUseCase = new GetOrdersUseCase(
    orderRepository,
    productRepository,
    userRepository
  );

  return new OrderController(getOrdersUseCase);
}
