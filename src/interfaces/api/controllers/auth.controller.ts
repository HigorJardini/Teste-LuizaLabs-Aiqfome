import { FastifyRequest, FastifyReply } from "fastify";
import { RegisterUseCase } from "@usecases";
import { LoginUseCase } from "@usecases";
import { RegisterUserDTO, LoginUserDTO } from "@dtos";

type ErrorMap = Record<string, { status: number; message: string }>;

export class AuthController {
  private errorMap: ErrorMap = {
    "Username already exists": {
      status: 409,
      message: "Username already exists",
    },
    "Invalid credentials": { status: 401, message: "Invalid credentials" },
    "Account is disabled": { status: 401, message: "Account is disabled" },
    "User no longer exists": { status: 401, message: "User no longer exists" },
  };

  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase
  ) {}

  private handleError(error: any, reply: FastifyReply): void {
    const errorInfo = this.errorMap[error.message] || {
      status: 500,
      message: "Internal server error",
    };

    reply.status(errorInfo.status).send({ message: errorInfo.message });
  }

  async register(
    request: FastifyRequest<{ Body: RegisterUserDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      await this.registerUseCase.execute(request.body);
      reply.status(201).send({ message: "User registered successfully" });
    } catch (error: any) {
      this.handleError(error, reply);
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginUserDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const authData = await this.loginUseCase.execute(request.body);
      reply.status(200).send(authData);
    } catch (error: any) {
      this.handleError(error, reply);
    }
  }
}
