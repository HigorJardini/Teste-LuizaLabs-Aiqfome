import { FastifyInstance } from "fastify";
import { makeTestController } from "@factories";

export async function testRoutes(fastify: FastifyInstance): Promise<void> {
  const testController = makeTestController();

  fastify.get(
    "/health",
    {
      schema: {
        tags: ["System"],
        description: "Health check endpoint",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    (request, reply) => testController(request, reply)
  );
}
