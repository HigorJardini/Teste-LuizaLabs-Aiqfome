import { FastifyInstance, FastifyRequest } from "fastify";
import { makeOrderController } from "@factories";
import { OrderFiltersDTO } from "@dtos";
import { authMiddleware } from "@middlewares";
import { getOrdersSchema } from "@schemas";

export async function orderRoutes(fastify: FastifyInstance): Promise<void> {
  const orderController = makeOrderController();

  fastify.get(
    "/orders",
    {
      preHandler: authMiddleware,
      schema: getOrdersSchema,
    },
    (request: FastifyRequest<{ Querystring: OrderFiltersDTO }>, reply) =>
      orderController.getOrders(request, reply)
  );
}
