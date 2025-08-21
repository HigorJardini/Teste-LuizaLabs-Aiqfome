import { FastifyInstance } from "fastify";
import { makeTestController } from "@factories";

export async function testRoutes(app: FastifyInstance) {
  app.get("/teste", makeTestController());
}
