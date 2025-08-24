import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.error(`[ERROR] ${request.method} ${request.url}:`, error);

  if (error.validation) {
    return reply.status(400).send({
      message: "Validation error",
      details: error.validation,
    });
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      message: "Route not found",
    });
  }

  if (
    error.message?.includes("duplicate key") ||
    error.message?.includes("unique constraint")
  ) {
    return reply.status(409).send({
      message: "Resource already exists",
    });
  }

  reply.status(error.statusCode || 500).send({
    message: error.message || "Internal server error",
  });
}
