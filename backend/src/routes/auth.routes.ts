import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { authenticate } from "../middlewares";
import { prisma } from "../config";

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);
  const controller = new AuthController(authService);

  // POST /auth/login (com rate limit: 5 tentativas a cada 10 minutos)
  app.post("/login", {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 10 * 60 * 1000,
        keyGenerator: (request) => request.ip,
      },
    },
    schema: {
      tags: ["Autenticação"],
      description: "Autenticar usuário",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
    },
    handler: controller.login.bind(controller),
  });

  // POST /auth/refresh
  app.post("/refresh", {
    schema: {
      tags: ["Autenticação"],
      description: "Renovar token de acesso",
    },
    handler: controller.refresh.bind(controller),
  });

  // POST /auth/logout
  app.post("/logout", {
    schema: {
      tags: ["Autenticação"],
      description: "Fazer logout",
    },
    preHandler: [authenticate],
    handler: controller.logout.bind(controller),
  });

  // GET /auth/roles - Listar roles disponíveis
  app.get("/roles", {
    schema: {
      tags: ["Autenticação"],
      description: "Listar roles disponíveis",
    },
    preHandler: [authenticate],
    handler: async (_request, reply) => {
      const roles = await prisma.role.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      return reply.send({ success: true, data: roles });
    },
  });

  // GET /auth/me
  app.get("/me", {
    schema: {
      tags: ["Autenticação"],
      description: "Retornar dados do usuário autenticado",
    },
    preHandler: [authenticate],
    handler: controller.me.bind(controller),
  });
}
