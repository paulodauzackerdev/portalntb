import { FastifyInstance } from "fastify";
import { uploadController } from "../controllers";
import { authenticate } from "../middlewares";

export async function uploadRoutes(app: FastifyInstance) {
  // POST /upload/presigned - Gerar URL assinada para upload
  app.post("/presigned", {
    schema: {
      tags: ["Upload"],
      description: "Gerar URL assinada para upload direto para R2/S3",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: uploadController.generatePresignedUrl.bind(uploadController),
  });

  // GET /upload/images - Listar imagens enviadas
  app.get("/images", {
    schema: {
      tags: ["Upload"],
      description: "Listar imagens enviadas pelo usuário",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: uploadController.list.bind(uploadController),
  });
}
