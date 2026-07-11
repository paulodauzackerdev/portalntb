import { FastifyRequest } from "fastify";
import { unauthorized } from "./error";
import type { JwtDecoded } from "../types/jwt";

/**
 * Retorna os dados do usuário autenticado ou lança 401.
 * Substitui `request.user!` em todos os controllers.
 */
export function requireAuth(request: FastifyRequest): JwtDecoded {
  if (!request.user) {
    throw unauthorized("Usuário não autenticado");
  }
  return request.user;
}
