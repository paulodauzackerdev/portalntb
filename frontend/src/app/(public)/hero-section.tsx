"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { NewsItem } from "../../types";
import { getCoverImageUrl } from "../../lib/image";

function NewsDate({ date }: { date: string }) {
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

export function HeroSection({ news }: { news: NewsItem[] }) {
  if (news.length === 0) return null;

  const main = news[0];
  const rest = news.slice(1, 4);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Main featured news */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <Link
          href={`/noticias/${main.slug}`}
          className="group relative block rounded-xl overflow-hidden bg-gray-900"
        >
          <div className="aspect-[16/9] lg:aspect-[21/9]">
            {getCoverImageUrl(main) ? (
              <Image
                src={getCoverImageUrl(main)!}
                alt={main.cover_image_alt || main.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <span className="text-white/10 text-8xl font-black">N</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded">
                {main.category.name}
              </span>
              {main.is_breaking && (
                <span className="text-[11px] uppercase tracking-wider font-semibold text-red-300 bg-red-900/60 px-2.5 py-1 rounded animate-pulse">
                  Urgente
                </span>
              )}
            </div>
            <h2 className="text-xl lg:text-3xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
              {main.title}
            </h2>
            {main.excerpt && (
              <p className="text-sm text-gray-300 mt-2 line-clamp-2 hidden sm:block">
                {main.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
              <span>{main.author.name}</span>
              {main.published_at && <NewsDate date={main.published_at} />}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Side featured news */}
      <div className="flex flex-col gap-4 lg:gap-5">
        {rest.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
          >
            <Link
              href={`/noticias/${item.slug}`}
              className="group flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all h-full"
            >
              {getCoverImageUrl(item) && (
                <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                  <Image
                    src={getCoverImageUrl(item)!}
                    alt={item.cover_image_alt || item.title}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600">
                  {item.category.name}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2 mt-1">
                  {item.title}
                </h3>
                {item.published_at && (
                  <span className="text-xs text-gray-400 mt-1.5"><NewsDate date={item.published_at} /></span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
