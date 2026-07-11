import { FastifyInstance } from "fastify";
import { newsController } from "../controllers";
import { authenticate } from "../middlewares";

export async function newsRoutes(app: FastifyInstance) {
  // GET /news - Listar notícias (público vê só publicadas, admin vê todas)
  app.get("/", {
    schema: {
      tags: ["Notícias"],
      description: "Listar notícias com paginação e filtros",
    },
    handler: newsController.list.bind(newsController),
  });

  // GET /news/:slug - Detalhes da notícia
  app.get("/:slug", {
    schema: {
      tags: ["Notícias"],
      description: "Retornar detalhes de uma notícia pelo slug",
    },
    handler: newsController.getBySlug.bind(newsController),
  });

  // POST /news - Criar notícia (autenticado)
  app.post("/", {
    schema: {
      tags: ["Notícias"],
      description: "Criar nova notícia",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: newsController.create.bind(newsController),
  });

  // PUT /news/:id - Atualizar notícia
  app.put("/:id", {
    schema: {
      tags: ["Notícias"],
      description: "Atualizar notícia",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: newsController.update.bind(newsController),
  });

  // PATCH /news/:id/publish - Publicar notícia
  app.patch("/:id/publish", {
    schema: {
      tags: ["Notícias"],
      description: "Publicar notícia",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: newsController.publish.bind(newsController),
  });

  // PATCH /news/:id/archive - Arquivar notícia
  app.patch("/:id/archive", {
    schema: {
      tags: ["Notícias"],
      description: "Arquivar notícia",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: newsController.archive.bind(newsController),
  });

  // DELETE /news/:id - Excluir notícia
  app.delete("/:id", {
    schema: {
      tags: ["Notícias"],
      description: "Excluir notícia",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: newsController.delete.bind(newsController),
  });
}
