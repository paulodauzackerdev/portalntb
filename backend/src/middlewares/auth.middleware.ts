import { FastifyRequest, FastifyReply } from "fastify";
import { unauthorized, forbidden } from "../utils";

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    throw unauthorized("Token inválido ou expirado");
  }
}

export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw unauthorized();
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(request.user.role)) {
      throw forbidden("Você não tem permissão para acessar este recurso");
    }
  };
}
