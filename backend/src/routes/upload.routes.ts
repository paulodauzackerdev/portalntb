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

  // PATCH /upload/images/:id - Atualizar alt/caption da imagem
  app.patch("/images/:id", {
    schema: {
      tags: ["Upload"],
      description: "Atualizar alt e caption de uma imagem",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: uploadController.updateImage.bind(uploadController),
  });

  // DELETE /upload/images/:id - Deletar imagem (R2 + banco)
  app.delete("/images/:id", {
    schema: {
      tags: ["Upload"],
      description: "Remover imagem do storage e banco de dados",
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    handler: uploadController.deleteImage.bind(uploadController),
  });
}
