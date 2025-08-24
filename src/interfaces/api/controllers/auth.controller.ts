import { FastifyRequest, FastifyReply } from "fastify";
import { Register, Login } from "@usecases";
import { RegisterUserDTO, LoginUserDTO } from "@dtos";

type ErrorMap = Record<string, { status: number; message: string }>;

export interface AuthController {
  register(
    request: FastifyRequest<{ Body: RegisterUserDTO }>,
    reply: FastifyReply
  ): Promise<void>;
  login(
    request: FastifyRequest<{ Body: LoginUserDTO }>,
    reply: FastifyReply
  ): Promise<void>;
}

export class AuthControllerImpl implements AuthController {
  private errorMap: ErrorMap = {
    "Username already exists": {
      status: 409,
      message: "Username already exists",
    },
    "Email already exists": {
      status: 409,
      message: "Email already exists",
    },
    "Invalid credentials": { status: 401, message: "Invalid credentials" },
    "Account is disabled": { status: 401, message: "Account is disabled" },
    "User profile not found": {
      status: 404,
      message: "User profile not found",
    },
  };

  constructor(
    private registerUseCase: Register,
    private loginUseCase: Login
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
      const result = await this.registerUseCase.execute(request.body);
      reply.status(201).send({
        message: "User registered successfully",
        userId: result.userId,
        loginId: result.loginId,
      });
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
