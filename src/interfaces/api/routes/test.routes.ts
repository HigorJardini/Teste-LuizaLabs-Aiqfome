import { FastifyInstance } from "fastify";
import { makeTestController } from "@factories";
import { authMiddleware } from "@middlewares";

export async function testRoutes(app: FastifyInstance) {
  // Rota sem autenticação
  app.get("/teste", makeTestController());

  // Rota com autenticação
  app.get("/teste/auth", { preHandler: authMiddleware }, makeTestController());
}
