import { FastifyInstance } from "fastify";
import { testRoutes } from "@routes";

const allRoutes = [testRoutes];

export async function registerRoutes(app: FastifyInstance) {
  for (const route of allRoutes) {
    await app.register(route);
  }
}
