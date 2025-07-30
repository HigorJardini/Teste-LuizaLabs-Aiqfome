import { FastifyRequest, FastifyReply } from "fastify";
import { verify } from "jsonwebtoken";
import { getEnv } from "@config/env";
import { TypeORMUserLoginRepository } from "@database-repositories";

declare module "fastify" {
  interface FastifyRequest {
    user?: any;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const sendAuthError = (message = "Invalid token") => {
    reply.status(401).send({ message });
    return;
  };

  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return sendAuthError("Token not provided");
    }

    const [, token] = authHeader.split(" ");

    try {
      const decoded = verify(token, getEnv().JWT_SECRET);

      const userRepository = new TypeORMUserLoginRepository();
      let user: { status: boolean } | null = null;

      if (typeof decoded !== "string" && "username" in decoded) {
        user = await userRepository.findByUsername(decoded.username);

        if (!user) {
          return sendAuthError();
        }

        if (!user.status) {
          return sendAuthError();
        }
      }

      request.user = decoded;
    } catch (error) {
      return sendAuthError();
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}
