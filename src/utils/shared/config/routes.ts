import { FastifyInstance } from "fastify";
import { testRoutes, authRoutes } from "@routes";

const allRoutes = [testRoutes, authRoutes];

export async function registerRoutes(app: FastifyInstance) {
  for (const route of allRoutes) {
    await app.register(route);
  }
}
