import { FastifyInstance } from "fastify";
import { categoryController } from "../controllers";
import { authenticate, authorize } from "../middlewares";

export async function categoryRoutes(app: FastifyInstance) {
  // GET /categories - Listar categorias (público)
  app.get("/", {
    schema: {
      tags: ["Categorias"],
      description: "Listar categorias",
    },
    handler: categoryController.list.bind(categoryController),
  });

  // POST /categories - Criar categoria (admin/editor)
  app.post("/", {
    schema: {
      tags: ["Categorias"],
      description: "Criar nova categoria",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN", "EDITOR")],
    handler: categoryController.create.bind(categoryController),
  });

  // PUT /categories/:id - Atualizar categoria
  app.put("/:id", {
    schema: {
      tags: ["Categorias"],
      description: "Atualizar categoria",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN", "EDITOR")],
    handler: categoryController.update.bind(categoryController),
  });

  // DELETE /categories/:id - Excluir categoria
  app.delete("/:id", {
    schema: {
      tags: ["Categorias"],
      description: "Excluir categoria",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: categoryController.delete.bind(categoryController),
  });
}
