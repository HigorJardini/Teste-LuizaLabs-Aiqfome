import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { AppDataSource } from "../../src/infrastructure/repositories/connection/pg";
import { registerRoutes } from "../../src/utils/shared/config/routes";
import { getEnv } from "../../src/utils/shared/config/env";

export async function setupTestApp() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = Fastify({
    logger: false,
  });

  await app.register(jwt, {
    secret: getEnv().JWT_SECRET,
  });

  await app.register(cors, {
    origin: true,
  });

  app.decorateRequest("user");

  await registerRoutes(app);

  return app;
}
