import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória").max(72, "Senha muito longa"),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
  }),
});

export const refreshResponseSchema = z.object({
  access_token: z.string(),
});

export const logoutResponseSchema = z.object({
  message: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
