import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(200, "Título deve ter no máximo 200 caracteres"),
  excerpt: z.string().max(500, "Resumo deve ter no máximo 500 caracteres").optional(),
  content: z.string().min(50, "Conteúdo deve ter no mínimo 50 caracteres").max(50000, "Conteúdo muito grande (máx 50KB)"),
  cover_image_key: z.string().min(1, "Key da imagem inválida").optional().nullable(),
  cover_image_alt: z.string().max(200).optional().nullable(),
  category_id: z.string().uuid("Categoria inválida"),
  tag_ids: z.array(z.string().uuid("Tag inválida")).max(10).optional(),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(300).optional().nullable(),
  seo_keywords: z.string().max(500).optional().nullable(),
  is_featured: z.boolean().default(false),
  is_breaking: z.boolean().default(false),
});

export const updateNewsSchema = createNewsSchema.partial();

export const newsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category_id: z.string().uuid().optional(),
  tag_id: z.string().uuid().optional(),
  author_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(["createdAt", "publishedAt", "title"]).default("publishedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  is_featured: z.preprocess(
    (val) => {
      if (val === undefined || val === "") return undefined;
      return val === "true" || val === true;
    },
    z.boolean().optional()
  ),
  is_breaking: z.preprocess(
    (val) => {
      if (val === undefined || val === "") return undefined;
      return val === "true" || val === true;
    },
    z.boolean().optional()
  ),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type NewsQueryInput = z.infer<typeof newsQuerySchema>;
