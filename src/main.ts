import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { getEnv } from "@config/env";
import { registerRoutes } from "@config/routes";

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "API Projeto Teste LuizaLabs",
        description: "Documentação gerada pelo Swagger",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${getEnv().PORT}`,
          description: "Local server",
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
  });

  await registerRoutes(app);

  await app.ready();
  await app.swagger();

  const { PORT } = getEnv();
  await app.listen({ port: PORT });

  console.log(`Server rodando na porta ${PORT}`);
  console.log(`Swagger disponível em http://localhost:${PORT}/docs`);
}

bootstrap();
