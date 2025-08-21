import Fastify from "fastify";
import { getEnv } from "@config/env";
import { registerRoutes } from "@config/routes";

async function bootstrap() {
  const app = Fastify({ logger: true });

  const { PORT } = getEnv();

  await registerRoutes(app);

  await app.listen({ port: PORT });
  console.log(`Server rodando na porta ${PORT}`);
}

bootstrap();
