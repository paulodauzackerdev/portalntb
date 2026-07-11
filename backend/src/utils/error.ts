import { FastifyReply } from "fastify";

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown[];

  constructor(statusCode: number, code: string, message: string, details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export function badRequest(message: string, details?: unknown[]): AppError {
  return new AppError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Não autorizado"): AppError {
  return new AppError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Acesso negado"): AppError {
  return new AppError(403, "FORBIDDEN", message);
}

export function notFound(message = "Recurso não encontrado"): AppError {
  return new AppError(404, "NOT_FOUND", message);
}

export function conflict(message: string): AppError {
  return new AppError(409, "CONFLICT", message);
}

export function unprocessable(message: string, details?: unknown[]): AppError {
  return new AppError(422, "UNPROCESSABLE_ENTITY", message, details);
}

export function internalError(message = "Erro interno do servidor"): AppError {
  return new AppError(500, "INTERNAL_ERROR", message);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendSuccess<T>(reply: FastifyReply, data: T, meta?: Record<string, any>, statusCode = 200) {
  return reply.status(statusCode).send({
    success: true,
    data,
    ...(meta && { meta }),
  });
}
