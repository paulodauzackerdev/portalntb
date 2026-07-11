import { FastifyRequest, FastifyReply } from "fastify";
import type { INewsRepository, ICategoryRepository, ITagRepository, IPortalRepository } from "../types/repositories";
import { newsRepository as defaultNewsRepo, categoryRepository as defaultCategoryRepo, tagRepository as defaultTagRepo, portalRepository as defaultPortalRepo } from "../repositories";
import { env } from "../config";

export class SeoController {
  constructor(
    private newsRepository: INewsRepository = defaultNewsRepo,
    private categoryRepository: ICategoryRepository = defaultCategoryRepo,
    private tagRepository: ITagRepository = defaultTagRepo,
    private portalRepository: IPortalRepository = defaultPortalRepo,
  ) {}
  private SITEMAP_MAX_URLS = 50000;

  async sitemap(request: FastifyRequest, reply: FastifyReply) {
    const portal = await this.portalRepository.findFirst();
    if (!portal) {
      return reply.status(404).send("Portal não encontrado");
    }

    const baseUrl = env.SITE_URL;
    const now = new Date().toISOString().split("T")[0];
    const totalNews = await this.newsRepository.count(portal.id, "PUBLISHED");
    const totalUrls = totalNews + 50; // estimativa: categorias + tags + home
    const totalPages = Math.ceil(totalUrls / this.SITEMAP_MAX_URLS);

    // Se tem até 1 página, gera sitemap único
    if (totalPages <= 1) {
      return this.generateSingleSitemap(portal.id, baseUrl, now, reply);
    }

    // Gera sitemap index
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap/static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;

    for (let i = 1; i <= totalPages; i++) {
      xml += `
  <sitemap>
    <loc>${baseUrl}/sitemap/news-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
    }

    xml += "\n</sitemapindex>";

    reply.header("Content-Type", "application/xml");
    return reply.send(xml);
  }

  async sitemapStatic(request: FastifyRequest, reply: FastifyReply) {
    const portal = await this.portalRepository.findFirst();
    if (!portal) {
      return reply.status(404).send("Portal não encontrado");
    }

    const baseUrl = env.SITE_URL;
    const now = new Date().toISOString().split("T")[0];

    const [categories, tags] = await Promise.all([
      this.categoryRepository.findMany(portal.id, true),
      this.tagRepository.findMany(portal.id),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const cat of categories) {
      xml += `
  <url>
    <loc>${baseUrl}/categorias/${cat.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const tag of tags) {
      xml += `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    xml += "\n</urlset>";

    reply.header("Content-Type", "application/xml");
    return reply.send(xml);
  }

  async sitemapNews(request: FastifyRequest, reply: FastifyReply) {
    const portal = await this.portalRepository.findFirst();
    if (!portal) {
      return reply.status(404).send("Portal não encontrado");
    }

    const baseUrl = env.SITE_URL;
    const now = new Date().toISOString().split("T")[0];
    const page = Number((request.params as { page?: string }).page) || 1;

    const news = await this.newsRepository.findPublished(
      portal.id,
      this.SITEMAP_MAX_URLS,
      (page - 1) * this.SITEMAP_MAX_URLS,
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const item of news) {
      const lastmod = item.publishedAt?.toISOString().split("T")[0] || now;
      xml += `
  <url>
    <loc>${baseUrl}/noticias/${item.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += "\n</urlset>";

    reply.header("Content-Type", "application/xml");
    return reply.send(xml);
  }

  private async generateSingleSitemap(portalId: string, baseUrl: string, now: string, reply: FastifyReply) {
    const [categories, tags, news] = await Promise.all([
      this.categoryRepository.findMany(portalId, true),
      this.tagRepository.findMany(portalId),
      this.newsRepository.findPublished(portalId, this.SITEMAP_MAX_URLS),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const cat of categories) {
      xml += `
  <url>
    <loc>${baseUrl}/categorias/${cat.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    for (const tag of tags) {
      xml += `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }

    for (const item of news) {
      const lastmod = item.publishedAt?.toISOString().split("T")[0] || now;
      xml += `
  <url>
    <loc>${baseUrl}/noticias/${item.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += "\n</urlset>";

    reply.header("Content-Type", "application/xml");
    return reply.send(xml);
  }

  async rss(request: FastifyRequest, reply: FastifyReply) {
    const portal = await this.portalRepository.findFirst();
    if (!portal) {
      return reply.status(404).send("Portal não encontrado");
    }

    const baseUrl = env.SITE_URL;
    const news = await this.newsRepository.findPublished(portal.id, 100);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${portal.name}</title>
    <link>${baseUrl}</link>
    <description>${portal.description || env.PORTAL_DESCRIPTION}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>`;

    for (const item of news) {
      const pubDate = item.publishedAt?.toUTCString() || new Date().toUTCString();
      xml += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${baseUrl}/noticias/${item.slug}</link>
      <guid>${baseUrl}/noticias/${item.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${item.excerpt || ""}]]></description>
      <author>${item.author.name}</author>
      <category>${item.category.name}</category>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    reply.header("Content-Type", "application/rss+xml");
    return reply.send(xml);
  }

  async robots(request: FastifyRequest, reply: FastifyReply) {
    const baseUrl = env.SITE_URL;

    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml
`;

    reply.header("Content-Type", "text/plain");
    return reply.send(robotsTxt);
  }
}

export const seoController = new SeoController();
