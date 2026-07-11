import { FastifyInstance } from "fastify";
import { tagController } from "../controllers";
import { authenticate, authorize } from "../middlewares";

export async function tagRoutes(app: FastifyInstance) {
  // GET /tags - Listar tags (público)
  app.get("/", {
    schema: {
      tags: ["Tags"],
      description: "Listar tags",
    },
    handler: tagController.list.bind(tagController),
  });

  // GET /tags/:slug - Buscar tag por slug (público)
  app.get("/:slug", {
    schema: {
      tags: ["Tags"],
      description: "Retornar dados de uma tag pelo slug",
    },
    handler: tagController.getBySlug.bind(tagController),
  });

  // POST /tags - Criar tag
  app.post("/", {
    schema: {
      tags: ["Tags"],
      description: "Criar nova tag",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN", "EDITOR")],
    handler: tagController.create.bind(tagController),
  });

  // PUT /tags/:id - Atualizar tag
  app.put("/:id", {
    schema: {
      tags: ["Tags"],
      description: "Atualizar tag",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN", "EDITOR")],
    handler: tagController.update.bind(tagController),
  });

  // DELETE /tags/:id - Excluir tag
  app.delete("/:id", {
    schema: {
      tags: ["Tags"],
      description: "Excluir tag",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: tagController.delete.bind(tagController),
  });
}
