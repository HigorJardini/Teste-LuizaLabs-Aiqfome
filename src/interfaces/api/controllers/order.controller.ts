import { FastifyRequest, FastifyReply } from "fastify";
import { GetOrdersUseCase } from "@usecases";
import { OrderFiltersDTO } from "@dtos";

export class OrderController {
  constructor(private getOrdersUseCase: GetOrdersUseCase) {}

  async getOrders(
    request: FastifyRequest<{ Querystring: OrderFiltersDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const filters = request.query;

      if (filters.order_id && typeof filters.order_id === "string") {
        filters.order_id = parseInt(filters.order_id, 10);
      }

      if (filters.user_id && typeof filters.user_id === "string") {
        filters.user_id = parseInt(filters.user_id, 10);
      }

      if (filters.page && typeof filters.page === "string") {
        filters.page = parseInt(filters.page, 10);
      }

      if (filters.limit && typeof filters.limit === "string") {
        filters.limit = parseInt(filters.limit, 10);
      }

      const result = await this.getOrdersUseCase.execute(filters);

      reply.status(200).send(result);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      reply
        .status(500)
        .send({ message: "Error fetching orders", error: error.message });
    }
  }
}
