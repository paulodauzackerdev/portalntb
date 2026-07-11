import { z } from "zod";

export const presignedUploadSchema = z.object({
  filename: z.string().min(1, "Nome do arquivo é obrigatório"),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"], {
    message: "Formato de imagem inválido. Aceitos: JPEG, PNG, WebP, GIF",
  }),
  size: z.number().int().max(10 * 1024 * 1024, "Tamanho máximo: 10 MB"),
});

export type PresignedUploadInput = z.infer<typeof presignedUploadSchema>;
