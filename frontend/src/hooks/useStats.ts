import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface DashboardStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  recentNews: {
    id: string;
    title: string;
    slug: string;
    status: string;
    published_at: string | null;
    created_at: string;
    author: { name: string };
    category: { name: string };
  }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const res = await api.get<DashboardStats>("/stats/dashboard");
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
