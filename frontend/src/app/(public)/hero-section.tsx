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

interface HeroSectionProps {
  news: NewsItem[];
}

export function HeroSection({ news }: HeroSectionProps) {
  if (news.length === 0) return null;

  const items = news.slice(0, 4);
  const [main, ...rest] = items;

  const item2 = rest[0];
  const item3 = rest[1];
  const item4 = rest[2];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 auto-rows-auto">
      {/* ── Notícia 1 (principal) ── 2 cols de largura, 2 rows de altura ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:col-span-2 sm:row-span-2"
      >
        <Link
          href={`/noticias/${main.slug}`}
          className="group relative block rounded-xl overflow-hidden bg-gray-900 h-full"
        >
          <div className="absolute inset-0">
            {getCoverImageUrl(main) ? (
              <Image
                src={getCoverImageUrl(main)!}
                alt={main.cover_image_alt || main.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
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
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-7">
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

      {/* ── Notícia 2 ── 2 cols no topo direito ── */}
      {item2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sm:col-span-2"
        >
          <Link
            href={`/noticias/${item2.slug}`}
            className="group relative block rounded-xl overflow-hidden bg-gray-900 h-full min-h-[180px] lg:min-h-[200px]"
          >
            <div className="absolute inset-0">
              {getCoverImageUrl(item2) ? (
                <Image
                  src={getCoverImageUrl(item2)!}
                  alt={item2.cover_image_alt || item2.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                  <span className="text-white/10 text-6xl font-black">N</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded inline-block mb-2">
                {item2.category.name}
              </span>
              <h3 className="text-base lg:text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                {item2.title}
              </h3>
              {item2.published_at && (
                <span className="text-xs text-gray-400 mt-1.5 block">
                  <NewsDate date={item2.published_at} />
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Notícia 3 ── canto inferior esquerdo ── */}
      {item3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="sm:col-span-1"
        >
          <Link
            href={`/noticias/${item3.slug}`}
            className="group relative block rounded-xl overflow-hidden bg-gray-900 h-full min-h-[180px] lg:min-h-[200px]"
          >
            <div className="absolute inset-0">
              {getCoverImageUrl(item3) ? (
                <Image
                  src={getCoverImageUrl(item3)!}
                  alt={item3.cover_image_alt || item3.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                  <span className="text-white/10 text-6xl font-black">N</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded inline-block mb-2">
                {item3.category.name}
              </span>
              <h3 className="text-sm lg:text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-3 leading-snug">
                {item3.title}
              </h3>
              {item3.published_at && (
                <span className="text-xs text-gray-400 mt-1.5 block">
                  <NewsDate date={item3.published_at} />
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Notícia 4 ── canto inferior direito ── */}
      {item4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="sm:col-span-1"
        >
          <Link
            href={`/noticias/${item4.slug}`}
            className="group relative block rounded-xl overflow-hidden bg-gray-900 h-full min-h-[180px] lg:min-h-[200px]"
          >
            <div className="absolute inset-0">
              {getCoverImageUrl(item4) ? (
                <Image
                  src={getCoverImageUrl(item4)!}
                  alt={item4.cover_image_alt || item4.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                  <span className="text-white/10 text-6xl font-black">N</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-1 rounded inline-block mb-2">
                {item4.category.name}
              </span>
              <h3 className="text-sm lg:text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-3 leading-snug">
                {item4.title}
              </h3>
              {item4.published_at && (
                <span className="text-xs text-gray-400 mt-1.5 block">
                  <NewsDate date={item4.published_at} />
                </span>
              )}
            </div>
          </Link>
        </motion.div>
      )}
    </section>
  );
}
