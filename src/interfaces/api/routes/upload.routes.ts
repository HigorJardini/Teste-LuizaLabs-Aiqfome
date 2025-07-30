import { FastifyInstance } from "fastify";
import { makeUploadController } from "@factories";
import { authMiddleware } from "@middlewares";
import { uploadSchema } from "@schemas";

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  const uploadController = makeUploadController();

  fastify.post(
    "/upload",
    {
      preHandler: authMiddleware,
      schema: uploadSchema,
    },
    (request, reply) => uploadController.uploadFile(request, reply)
  );
}
