import { FastifyInstance } from "fastify";
import { testRoutes, authRoutes, uploadRoutes, orderRoutes } from "@routes";

const allRoutes = [testRoutes, authRoutes, uploadRoutes, orderRoutes];

export async function registerRoutes(app: FastifyInstance) {
  for (const route of allRoutes) {
    await app.register(route);
  }
}
