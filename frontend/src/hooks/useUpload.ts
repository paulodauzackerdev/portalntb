import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  PresignedUploadPayload,
  PresignedUploadResult,
} from "../types";

// ─── Tipos para update e delete ──────────────────────────────────

export interface UpdateImagePayload {
  id: string;
  alt?: string | null;
  caption?: string | null;
}

export interface UpdateImageResult {
  id: string;
  key: string;
  url: string;
  alt: string | null;
  caption: string | null;
  size: number;
  mimeType: string;
  created_at: string;
}

export function usePresignedUpload() {
  return useMutation({
    mutationFn: async (data: PresignedUploadPayload) => {
      const res = await api.post<PresignedUploadResult>("/upload/presigned", data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
  });
}

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error("Erro ao fazer upload da imagem");
  }
}

// ─── Atualizar alt/caption ───────────────────────────────────────

export function useUpdateImage() {
  return useMutation({
    mutationFn: async ({ id, alt, caption }: UpdateImagePayload) => {
      const res = await api.patch<UpdateImageResult>(`/upload/images/${id}`, {
        alt: alt ?? null,
        caption: caption ?? null,
      });
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
  });
}

// ─── Excluir imagem ──────────────────────────────────────────────

export function useDeleteImage() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete<{ message: string }>(`/upload/images/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
  });
}
