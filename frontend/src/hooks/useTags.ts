import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Tag } from "../types";

export function useTags(search?: string) {
  return useQuery({
    queryKey: ["tags", search],
    queryFn: async () => {
      const res = await api.get<Tag[]>("/tags", search ? { search } : undefined);
      return res.data || [];
    },
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.post<Tag>("/tags", data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/tags/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}
