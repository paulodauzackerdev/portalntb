import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { NewsItem, CreateNewsPayload, UpdateNewsPayload } from "../types";

export function useNewsList(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  category_id?: string;
}) {
  return useQuery({
    queryKey: ["news", params],
    queryFn: async () => {
      const res = await api.get<NewsItem[]>("/news", params as Record<string, string | number | boolean | undefined>);
      return { data: res.data, meta: res.meta };
    },
  });
}

export function useNews(slug: string) {
  return useQuery({
    queryKey: ["news", "detail", slug],
    queryFn: async () => {
      const res = await api.get<NewsItem>(`/news/${slug}`);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    enabled: !!slug,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateNewsPayload) => {
      const res = await api.post<NewsItem>("/news", data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"], refetchType: "all" });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateNewsPayload) => {
      const { id, ...payload } = data;
      const res = await api.put<NewsItem>(`/news/${id}`, payload);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"], refetchType: "all" });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/news/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"], refetchType: "all" });
    },
  });
}

export function usePublishNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/news/${id}/publish`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"], refetchType: "all" });
    },
  });
}

export function useFeaturedNews() {
  return useQuery({
    queryKey: ["news", "featured"],
    queryFn: async () => {
      const res = await api.get<NewsItem[]>("/news", { status: "PUBLISHED", is_featured: true, limit: 10, sort: "publishedAt" });
      return res.data || [];
    },
  });
}

export function useBreakingNews() {
  return useQuery({
    queryKey: ["news", "breaking"],
    queryFn: async () => {
      const res = await api.get<NewsItem[]>("/news", { status: "PUBLISHED", is_breaking: true, limit: 5, sort: "publishedAt" });
      return res.data || [];
    },
  });
}
