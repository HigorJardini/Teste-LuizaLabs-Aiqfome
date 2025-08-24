import { FastifyRequest, FastifyReply } from "fastify";
import { verify, JwtPayload } from "jsonwebtoken";
import { getEnv } from "@config/env";
import { TypeORMUserLoginRepository } from "@database-repositories";

interface TokenPayload {
  sub: number;
  username: string;
  userId: number;
  iat?: number;
  exp?: number;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authenticate(
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

    const [scheme, token] = authHeader.split(" ");

    if (!/^Bearer$/i.test(scheme)) {
      return sendAuthError("Token malformatted");
    }

    try {
      const decoded = verify(token, getEnv().JWT_SECRET);

      if (typeof decoded !== "object" || !decoded) {
        return sendAuthError("Invalid token payload");
      }

      const { sub, username, userId } = decoded as JwtPayload;

      if (!sub || !username || !userId) {
        return sendAuthError("Invalid token payload");
      }

      if (!decoded.sub || !decoded.username || !decoded.userId) {
        return sendAuthError("Invalid token payload");
      }

      const userLoginRepository = new TypeORMUserLoginRepository();
      const userLogin = await userLoginRepository.findByUsername(
        decoded.username
      );

      if (!userLogin) {
        return sendAuthError("User not found");
      }

      if (!userLogin.status) {
        return sendAuthError("Account is disabled");
      }

      request.user = {
        sub: Number(decoded.sub),
        username: decoded.username as string,
        userId: Number(decoded.userId),
        iat: decoded.iat,
        exp: decoded.exp,
      };
    } catch (error) {
      return sendAuthError();
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    reply.status(500).send({ message: "Internal server error" });
  }
}
