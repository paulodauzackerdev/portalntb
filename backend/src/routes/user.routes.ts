import { FastifyInstance } from "fastify";
import { userController } from "../controllers";
import { authenticate, authorize } from "../middlewares";

export async function userRoutes(app: FastifyInstance) {
  // GET /users - Listar usuários (admin)
  app.get("/", {
    schema: {
      tags: ["Usuários"],
      description: "Listar usuários",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: userController.list.bind(userController),
  });

  // POST /users - Criar usuário (admin)
  app.post("/", {
    schema: {
      tags: ["Usuários"],
      description: "Criar novo usuário",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: userController.create.bind(userController),
  });

  // PUT /users/:id - Atualizar usuário (admin)
  app.put("/:id", {
    schema: {
      tags: ["Usuários"],
      description: "Atualizar usuário",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: userController.update.bind(userController),
  });

  // DELETE /users/:id - Desativar usuário (admin)
  app.delete("/:id", {
    schema: {
      tags: ["Usuários"],
      description: "Desativar usuário",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate, authorize("ADMIN")],
    handler: userController.delete.bind(userController),
  });

  // PUT /users/profile - Atualizar próprio perfil
  app.put("/profile", {
    schema: {
      tags: ["Usuários"],
      description: "Atualizar próprio perfil",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: userController.updateProfile.bind(userController),
  });

  // PUT /users/change-password - Alterar própria senha
  app.put("/change-password", {
    schema: {
      tags: ["Usuários"],
      description: "Alterar própria senha",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: userController.changePassword.bind(userController),
  });
}
