import { FastifyInstance } from "fastify";
import { portalController } from "../controllers";
import { authenticate } from "../middlewares";

export async function portalRoutes(app: FastifyInstance) {
  // GET /portal/info - Informações públicas do portal (sem auth)
  app.get("/info", {
    schema: {
      tags: ["Portal"],
      description: "Retornar informações públicas do portal",
    },
    handler: portalController.getPublicInfo.bind(portalController),
  });

  // GET /portal/settings - Configurações do portal (auth)
  app.get("/settings", {
    schema: {
      tags: ["Portal"],
      description: "Retornar configurações do portal",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: portalController.getSettings.bind(portalController),
  });

  // PUT /portal/settings - Atualizar configurações (auth)
  app.put("/settings", {
    schema: {
      tags: ["Portal"],
      description: "Atualizar configurações do portal",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: portalController.updateSettings.bind(portalController),
  });
}
