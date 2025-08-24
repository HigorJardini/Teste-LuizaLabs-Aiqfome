import { FastifyInstance } from "fastify";
import { UserFactory } from "@factories";
import {
  getProfileSchema,
  updateUserSchema,
  deleteProfileSchema,
} from "@schemas";
import { UpdateUserDTO } from "@dtos";
import { authenticate } from "@middlewares";

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const userController = UserFactory.makeUserController();

  fastify.get(
    "/me",
    {
      preHandler: authenticate,
      schema: getProfileSchema,
    },
    (request, reply) => userController.getProfile(request, reply)
  );

  fastify.put<{
    Body: UpdateUserDTO;
  }>(
    "/me",
    {
      preHandler: authenticate,
      schema: updateUserSchema,
    },
    (request, reply) => userController.updateProfile(request, reply)
  );

  fastify.delete(
    "/me",
    {
      preHandler: authenticate,
      schema: deleteProfileSchema,
    },
    (request, reply) => userController.deleteProfile(request, reply)
  );
}
