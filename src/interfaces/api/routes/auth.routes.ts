import { FastifyInstance } from "fastify";
import { AuthFactory } from "@factories";
import { registerSchema, loginSchema } from "@schemas";
import { RegisterUserDTO, LoginUserDTO } from "@dtos";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authController = AuthFactory.makeAuthController();

  fastify.post<{
    Body: RegisterUserDTO;
  }>("/auth/register", { schema: registerSchema }, (request, reply) =>
    authController.register(request, reply)
  );

  fastify.post<{
    Body: LoginUserDTO;
  }>("/auth/login", { schema: loginSchema }, (request, reply) =>
    authController.login(request, reply)
  );
}
