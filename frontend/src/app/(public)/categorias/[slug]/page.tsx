import { notFound } from "next/navigation";
import { apiGet } from "../../../../lib/api.server";
import { NewsGrid } from "../../../../components/news/NewsGrid";
import type { NewsItem, Category } from "../../../../types";
import type { Metadata } from "next";

export const revalidate = 120;

async function getCategory(slug: string): Promise<Category & { news: NewsItem[] } | null> {
  try {
    const res = await apiGet<Category[]>("/categories");
    const categories = res.data || [];
    const category = categories.find((c) => c.slug === slug) || null;
    if (!category) return null;

    // Buscar notícias filtrando pelo ID da categoria (server-side)
    const newsRes = await apiGet<NewsItem[]>("/news", {
      status: "PUBLISHED",
      category_id: category.id,
      limit: 50
    });

    return { ...category, news: newsRes.data || [] };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return {
    title: category?.name || slug,
    description: category?.description || `Notícias sobre ${slug}`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const news = category.news;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </div>
      <NewsGrid news={news} />
    </div>
  );
}
