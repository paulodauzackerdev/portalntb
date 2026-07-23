import { apiGet } from "../../lib/api.server";
import type { NewsItem } from "../../types";
import { NewsGrid } from "../../components/news/NewsGrid";
import { HeroSection } from "./hero-section";

export const revalidate = 60;

async function getFeaturedNews(): Promise<NewsItem[]> {
  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", is_featured: "true", limit: 20 });
    return res.data || [];
  } catch {
    return [];
  }
}

async function getBreakingNews(): Promise<NewsItem[]> {
  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", is_breaking: "true", limit: 5 });
    return res.data || [];
  } catch {
    return [];
  }
}

async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", limit: 20 });
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, breaking, latest] = await Promise.all([
    getFeaturedNews(),
    getBreakingNews(),
    getLatestNews(),
  ]);

  const hasFeatured = featured.length > 0;
  const allNews = hasFeatured ? featured : latest;
  const heroNews = allNews.slice(0, 4);
  const gridNews = allNews.slice(4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      {/* Breaking News Banner */}
      {breaking.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-[11px] uppercase font-bold px-2.5 py-1 rounded tracking-wider animate-pulse shrink-0">
              Últimas
            </span>
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <div className="flex ticker-track whitespace-nowrap">
                {[...breaking, ...breaking].map((item, idx) => (
                  <a
                    key={`${item.id}-${idx}`}
                    href={`/noticias/${item.slug}`}
                    className="inline-flex items-center gap-0 text-sm font-medium text-red-800 hover:text-red-600 transition-colors mx-4 shrink-0"
                  >
                    {idx > 0 && idx < breaking.length && (
                      <span className="text-red-300 mr-4 shrink-0">|</span>
                    )}
                    <span className="truncate max-w-[280px] lg:max-w-[400px]">{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection news={heroNews} />

      {/* Latest News Grid */}
      <div className="mt-10 lg:mt-12">
        <NewsGrid news={gridNews} title="Últimas Notícias" />
      </div>
    </div>
  );
}
