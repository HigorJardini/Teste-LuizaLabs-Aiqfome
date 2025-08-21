import { FastifyRequest, FastifyReply } from "fastify";

export const testController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  return reply.status(200).send({
    message: "Projeto LuizaLabs Iniciado",
  });
};
