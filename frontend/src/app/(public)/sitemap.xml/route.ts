import { apiGet } from "../../../lib/api.server";
import type { NewsItem, Category } from "../../../types";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date().toISOString().split("T")[0];

  try {
    const [newsRes, catRes] = await Promise.all([
      apiGet<NewsItem[]>("/news", { status: "PUBLISHED", limit: 50000 }),
      apiGet<Category[]>("/categories"),
    ]);

    const news = newsRes.data || [];
    const categories = catRes.data || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>`;

    for (const cat of categories) {
      xml += `
  <url><loc>${baseUrl}/categorias/${cat.slug}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`;
    }

    for (const item of news) {
      const lastmod = item.published_at?.split("T")[0] || now;
      xml += `
  <url><loc>${baseUrl}/noticias/${item.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
    }

    xml += "\n</urlset>";

    return new Response(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch {
    // Retorna sitemap vazio em vez de texto de erro para não quebrar crawlers
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>
</urlset>`;
    return new Response(fallbackXml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
