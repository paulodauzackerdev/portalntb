"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import type { NewsItem } from "../../types";
import { getCoverImageUrl } from "../../lib/image";

function NewsDate({ date }: { date: string }) {
  // Renderizado no servidor + cliente de forma consistente
  // suppressHydrationWarning evita warnings de mismatch de locale
  return (
    <span suppressHydrationWarning>
      {new Date(date).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </span>
  );
}

export function NewsCard({ news, index = 0 }: { news: NewsItem; index?: number }) {
  const coverUrl = getCoverImageUrl(news);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
    >
      <Link href={`/noticias/${news.slug}`} className="group block h-full">
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="aspect-[16/9] overflow-hidden bg-gray-100">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={news.cover_image_alt || news.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-300 text-4xl font-bold">N</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Category & badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {news.category.name}
              </span>
              {news.is_breaking && (
                <span className="text-[11px] uppercase tracking-wider font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded animate-pulse">
                  Urgente
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2 leading-snug">
              {news.title}
            </h2>

            {/* Excerpt */}
            {news.excerpt && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1 leading-relaxed">
                {news.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {news.author.name}
              </span>
              {news.published_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <NewsDate date={news.published_at} />
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
