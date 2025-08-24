import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetProfileUseCase,
  UpdateProfileUseCase,
  DeleteProfileUseCase,
} from "@usecases";
import { UpdateUserDTO } from "@dtos";

export interface UserController {
  getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  updateProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  deleteProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export class UserControllerImpl implements UserController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase
  ) {}

  async getProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const user = await this.getProfileUseCase.execute(userId);

      reply.code(200).send(user);
    } catch (error) {
      reply
        .code(404)
        .send({ message: (error as Error).message || "User not found" });
    }
  }

  async updateProfile(
    request: FastifyRequest<{ Body: UpdateUserDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      const userData = request.body;

      const updatedUser = await this.updateProfileUseCase.execute({
        userId,
        ...userData,
      });

      reply.code(200).send(updatedUser);
    } catch (error) {
      reply
        .code(400)
        .send({ message: (error as Error).message || "Failed to update user" });
    }
  }

  async deleteProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request.user as any).userId;
      await this.deleteProfileUseCase.execute(userId);

      reply.code(204).send();
    } catch (error) {
      reply
        .code(400)
        .send({ message: (error as Error).message || "Failed to delete user" });
    }
  }
}
