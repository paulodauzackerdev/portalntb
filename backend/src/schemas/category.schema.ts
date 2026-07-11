import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  description: z.string().max(300).optional().nullable(),
  parent_id: z.string().uuid("Categoria pai inválida").optional().nullable(),
  order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
