import { apiGet } from "../../../lib/api.server";
import { PORTAL_DISPLAY_NAME, PORTAL_METADATA_DESCRIPTION } from "../../../lib/utils";
import type { NewsItem } from "../../../types";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await apiGet<NewsItem[]>("/news", { status: "PUBLISHED", limit: 50 });
    const news = res.data || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${PORTAL_DISPLAY_NAME}</title>
    <link>${baseUrl}</link>
    <description>${PORTAL_METADATA_DESCRIPTION}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>`;

    for (const item of news) {
      const pubDate = item.published_at ? new Date(item.published_at).toUTCString() : new Date().toUTCString();
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

    return new Response(xml, {
      headers: { "Content-Type": "application/rss+xml" },
    });
  } catch {
    return new Response("Erro ao gerar RSS", { status: 500 });
  }
}
