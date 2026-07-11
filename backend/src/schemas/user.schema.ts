import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres")
    .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve ter pelo menos um número"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100),
  role_id: z.string().uuid("Role inválida"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role_id: z.string().uuid("Role inválida").optional(),
  active: z.boolean().optional(),
  avatar: z.string().url("URL do avatar inválida").optional().nullable(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Senha atual é obrigatória"),
  new_password: z
    .string()
    .min(8, "Nova senha deve ter no mínimo 8 caracteres")
    .max(72, "Nova senha deve ter no máximo 72 caracteres")
    .regex(/[A-Z]/, "Nova senha deve ter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Nova senha deve ter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Nova senha deve ter pelo menos um número"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
