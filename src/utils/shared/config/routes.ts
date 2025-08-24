import { FastifyInstance } from "fastify";
import {
  testRoutes,
  authRoutes,
  userRoutes,
  favoriteProductRoutes,
} from "@routes";

const allRoutes = [testRoutes, authRoutes, userRoutes, favoriteProductRoutes];

export async function registerRoutes(app: FastifyInstance) {
  for (const route of allRoutes) {
    await app.register(route);
  }
}
