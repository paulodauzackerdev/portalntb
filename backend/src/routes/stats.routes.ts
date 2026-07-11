import { FastifyInstance } from "fastify";
import { statsController } from "../controllers/stats.controller";
import { authenticate } from "../middlewares";

export async function statsRoutes(app: FastifyInstance) {
  // GET /stats/dashboard - Estatísticas do dashboard (autenticado)
  app.get("/dashboard", {
    schema: {
      tags: ["Estatísticas"],
      description: "Retorna estatísticas agregadas para o dashboard",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: statsController.dashboard.bind(statsController),
  });
}
