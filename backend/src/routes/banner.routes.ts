import { FastifyInstance } from "fastify";
import { bannerController } from "../controllers/banner.controller";
import { authenticate } from "../middlewares";

export async function bannerRoutes(app: FastifyInstance) {
  // GET /banner — Público: retorna banner ativo
  app.get("/", {
    schema: {
      tags: ["Banner"],
      description: "Retorna o banner ativo do portal",
    },
    handler: bannerController.getActive.bind(bannerController),
  });

  // GET /banner/admin — Admin: retorna o banner atual
  app.get("/admin", {
    schema: {
      tags: ["Banner"],
      description: "Retorna o banner atual (admin)",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: bannerController.getCurrent.bind(bannerController),
  });

  // GET /banner/stats — Admin: estatísticas detalhadas
  app.get("/stats", {
    schema: {
      tags: ["Banner"],
      description: "Retorna estatísticas detalhadas de cliques do banner",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: bannerController.stats.bind(bannerController),
  });

  // DELETE /banner/stats — Admin: reseta estatísticas
  app.delete("/stats", {
    schema: {
      tags: ["Banner"],
      description: "Reseta todas as estatísticas de clique do banner",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: bannerController.resetStats.bind(bannerController),
  });

  // PUT /banner — Admin: cria ou atualiza o banner
  app.put("/", {
    schema: {
      tags: ["Banner"],
      description: "Cria ou atualiza o banner do portal",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: bannerController.upsert.bind(bannerController),
  });

  // DELETE /banner — Admin: remove o banner
  app.delete("/", {
    schema: {
      tags: ["Banner"],
      description: "Remove o banner do portal",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: bannerController.delete.bind(bannerController),
  });

  // POST /banner/click — Público: registrar clique
  app.post("/click", {
    schema: {
      tags: ["Banner"],
      description: "Registra um clique no banner",
    },
    handler: bannerController.click.bind(bannerController),
  });
}
