import Fastify from "fastify";
import multipart from "@fastify/multipart";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import { AppDataSource } from "../../src/infrastructure/repositories/connection/pg";
import { registerRoutes } from "../../src/utils/shared/config/routes";
import { getEnv } from "../../src/utils/shared/config/env";

export async function setupTestApp() {
  // Garantir que o banco de dados está conectado
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = Fastify({
    logger: false, // desativar logger nos testes
  });

  // Registrar plugins
  await app.register(multipart, {
    limits: {
      fileSize: getEnv().UPLOAD_FILE_SIZE_LIMIT || 50 * 1024 * 1024,
      files: getEnv().UPLOAD_MAX_FILES || 10,
      fieldSize: getEnv().UPLOAD_FIELD_SIZE || 1 * 1024 * 1024,
    },
    attachFieldsToBody: false,
  });

  await app.register(jwt, {
    secret: getEnv().JWT_SECRET,
  });

  await app.register(cors, {
    origin: true,
  });

  // Decorador para acessar o usuário autenticado
  app.decorateRequest("user");

  // Registrar rotas usando a função correta do projeto
  await registerRoutes(app);

  return app;
}
