import { Search } from "lucide-react";
import { apiGet } from "../../../lib/api.server";
import { NewsGrid } from "../../../components/news/NewsGrid";
import type { NewsItem } from "../../../types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar notícias",
  description: "Busque notícias no portal",
};

async function getSearchResults(q: string): Promise<NewsItem[]> {
  if (!q) return [];
  try {
    const res = await apiGet<NewsItem[]>("/news", { search: q, status: "PUBLISHED" });
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = await getSearchResults(q || "");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Buscar Notícias</h1>
        <form className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Digite sua busca..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </form>
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-6">
          {results.length === 0
            ? `Nenhum resultado encontrado para "${q}"`
            : `${results.length} resultado(s) para "${q}"`}
        </p>
      )}

      <NewsGrid news={results} />
    </div>
  );
}
