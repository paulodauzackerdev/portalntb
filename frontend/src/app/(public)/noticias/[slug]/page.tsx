import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Eye, ArrowLeft } from "lucide-react";
import { apiGet } from "../../../../lib/api.server";
import { formatDateTime, PORTAL_DISPLAY_NAME } from "../../../../lib/utils";
import { sanitizeHtml } from "../../../../lib/sanitize";
import type { NewsItem } from "../../../../types";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getNews(slug: string): Promise<NewsItem | null> {
  try {
    const res = await apiGet<NewsItem>(`/news/${slug}`);
    if (!res.success) return null;
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return { title: "Notícia não encontrada" };

  // Usar cover_image_url (resolvido pelo backend) com fallback
  const imageUrl = news.cover_image_url || news.cover_image || news.cover_image_key || undefined;

  return {
    title: news.seo_title || news.title,
    description: news.seo_description || news.excerpt || "",
    keywords: news.seo_keywords || undefined,
    openGraph: {
      title: news.seo_title || news.title,
      description: news.seo_description || news.excerpt || "",
      type: "article",
      publishedTime: news.published_at || undefined,
      authors: [news.author.name],
      images: news.og_image || imageUrl ? [{ url: news.og_image || imageUrl || "" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: news.seo_title || news.title,
      description: news.seo_description || news.excerpt || "",
      images: news.og_image || imageUrl ? [news.og_image || imageUrl || ""] : undefined,
    },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    notFound();
  }

  // Resolver URL da imagem (prioridade: resolvida pelo backend > legada > key)
  const coverImageUrl = news.cover_image_url || news.cover_image || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.excerpt,
    image: coverImageUrl,
    datePublished: news.published_at,
    dateModified: news.updated_at || news.created_at,
    author: { "@type": "Person", name: news.author.name },
    publisher: {
      "@type": "Organization",
      name: PORTAL_DISPLAY_NAME,
      logo: { "@type": "ImageObject", url: "/logo.png" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link href={`/categorias/${news.category.slug}`} className="hover:text-gray-900 transition-colors">
            {news.category.name}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{news.title}</span>
        </nav>

        <article className="max-w-3xl mx-auto">
          {/* Category & badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded">
              {news.category.name}
            </span>
            {news.is_breaking && (
              <span className="text-xs uppercase tracking-wider font-semibold text-red-700 bg-red-50 px-3 py-1 rounded animate-pulse">
                Urgente
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            {news.title}
          </h1>

          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6 border-l-4 border-blue-600 pl-5 italic">
              {news.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium text-gray-700">{news.author.name}</span>
            </span>
            {news.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateTime(news.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {news.views} visualizações
            </span>
          </div>

          {/* Cover image */}
          {coverImageUrl && (
            <div className="rounded-xl overflow-hidden mb-8 shadow-md">
              <Image
                src={coverImageUrl}
                alt={news.cover_image_alt || news.title}
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                priority
              />
              {news.cover_image_alt && (
                <p className="text-sm text-gray-500 mt-2 text-center pb-3 italic">
                  {news.cover_image_alt}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div
            className="prose-news max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content || "") }}
          />

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-full transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
