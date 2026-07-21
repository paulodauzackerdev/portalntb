import { z } from "zod";

export const presignedUploadSchema = z.object({
  filename: z.string().min(1, "Nome do arquivo é obrigatório"),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"], {
    message: "Formato de imagem inválido. Aceitos: JPEG, PNG, WebP, GIF",
  }),
  size: z.number().int().max(10 * 1024 * 1024, "Tamanho máximo: 10 MB"),
});

export const updateImageSchema = z.object({
  alt: z.string().max(255, "Texto alternativo muito longo").optional().nullable(),
  caption: z.string().max(500, "Legenda muito longa").optional().nullable(),
});

export const imageIdParams = z.object({
  id: z.string().uuid("ID de imagem inválido"),
});

export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
