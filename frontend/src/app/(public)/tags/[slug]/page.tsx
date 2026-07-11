import { notFound } from "next/navigation";
import { apiGet } from "../../../../lib/api.server";
import { NewsGrid } from "../../../../components/news/NewsGrid";
import type { NewsItem } from "../../../../types";
import type { Metadata } from "next";

export const revalidate = 120;

interface TagData {
  id: string;
  name: string;
  slug: string;
}

async function getTagBySlug(slug: string): Promise<TagData | null> {
  try {
    const res = await apiGet<TagData>(`/tags/${slug}`);
    if (res.success && res.data) return res.data;
    return null;
  } catch {
    return null;
  }
}

async function getNewsByTag(tagId: string): Promise<NewsItem[]> {
  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", tag_id: tagId, limit: 50 });
    return res.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return {
    title: tag ? `#${tag.name}` : slug,
    description: tag ? `Notícias sobre ${tag.name}` : `Notícias sobre ${slug}`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const news = await getNewsByTag(tag.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">#{tag.name}</h1>
      </div>
      <NewsGrid news={news} />
    </div>
  );
}
