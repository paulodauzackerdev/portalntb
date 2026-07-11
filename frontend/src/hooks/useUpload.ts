import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PresignedUploadPayload, PresignedUploadResult } from "../types";

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
