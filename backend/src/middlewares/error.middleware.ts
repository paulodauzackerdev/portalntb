import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../utils";
import { ZodError } from "zod";

export function errorMiddleware(
  error: Error | AppError | ZodError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Erros do Zod (validação)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

  // Erros customizados da aplicação
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Erro genérico
  const statusCode = (error as { statusCode?: number }).statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    },
  });
}
