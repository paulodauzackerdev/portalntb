import { Header } from "../components/layouts/Header";
import { Footer } from "../components/layouts/Footer";
import { getPublicCategories } from "../lib/categories.server";
import { apiGet } from "../lib/api.server";
import { PORTAL_NAME, PORTAL_TAGLINE, PORTAL_DESCRIPTION } from "../lib/utils";
import { NewsGrid } from "../components/news/NewsGrid";
import { HeroSection } from "./(public)/hero-section";
import type { NewsItem } from "../types";

interface PortalInfo {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
}

interface BannerData {
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
}

async function getPortalInfo(): Promise<PortalInfo> {
  try {
    const res = await apiGet<PortalInfo>("/portal/info");
    if (res.success && res.data) return res.data;
  } catch {}
  return { name: PORTAL_NAME, slug: "portal", description: PORTAL_DESCRIPTION, logo: null };
}

async function getActiveBanner(): Promise<BannerData | null> {
  try {
    const res = await apiGet<BannerData>("/banner");
    if (res.success && res.data) return res.data;
  } catch {}
  return null;
}

async function getFeaturedNews(): Promise<NewsItem[]> {
  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", limit: 3 });
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
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", limit: 9 });
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, portal, banner, featured, breaking, latest] = await Promise.all([
    getPublicCategories(),
    getPortalInfo(),
    getActiveBanner(),
    getFeaturedNews(),
    getBreakingNews(),
    getLatestNews(),
  ]);

  return (
    <>
      <Header categories={categories} portalName={portal.name} portalTagline={portal.description || PORTAL_TAGLINE} banner={banner} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
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
          <HeroSection news={featured.length > 0 ? featured : latest.slice(0, 4)} />
          <div className="mt-10 lg:mt-12">
            <NewsGrid news={latest.slice(4)} title="Últimas Notícias" />
          </div>
        </div>
      </main>
      <Footer portalName={portal.name} portalDescription={portal.description || ""} />
    </>
  );
}
