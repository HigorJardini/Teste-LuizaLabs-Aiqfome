import "reflect-metadata";
import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { initializeDatabase } from "@database-connection";
import { getEnv } from "@config/env";
import { registerRoutes } from "@config/routes";
import { errorHandler } from "@middlewares";

const app: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

async function bootstrap() {
  try {
    console.log("Starting application...");

    const env = getEnv();

    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    await app.register(swagger, {
      openapi: {
        info: {
          title: "API Favorite Products",
          description: "API for managing favorite products from external API",
          version: "1.0.0",
        },
        servers: [
          {
            url: `http://localhost:${getEnv().PORT}`,
            description: "Local server",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
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

    app.setErrorHandler(errorHandler);

    await registerRoutes(app);

    const { PORT } = getEnv();
    await app.listen({ port: PORT, host: "0.0.0.0" });

    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/docs`);
  } catch (error) {
    console.error("Error starting application:", error);
    process.exit(1);
  }
}

bootstrap();
