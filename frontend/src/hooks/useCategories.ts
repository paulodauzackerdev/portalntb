import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "../types";

export function useCategories(active?: boolean) {
  return useQuery({
    queryKey: ["categories", active],
    queryFn: async () => {
      const res = await api.get<Category[]>("/categories", active !== undefined ? { active: String(active) } : undefined);
      return res.data || [];
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryPayload) => {
      const res = await api.post<Category>("/categories", data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCategoryPayload) => {
      const { id, ...payload } = data;
      const res = await api.put<Category>(`/categories/${id}`, payload);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/categories/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
