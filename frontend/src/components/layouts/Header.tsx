"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, Facebook, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicCategory } from "../../lib/categories.server";
import { splitPortalName } from "../../lib/utils";
import { HeaderBanner } from "./HeaderBanner";

interface BannerInfo {
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
}

interface HeaderProps {
  categories: PublicCategory[];
  portalName: string;
  portalTagline: string;
  banner?: BannerInfo | null;
}

export function Header({ categories, portalName, portalTagline, banner }: HeaderProps) {
  const [firstWord, rest] = splitPortalName(portalName);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const formattedDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const handleScroll = () => {
      // Ativa quando o scroll ultrapassar ~150px (altura estimada da topbar + masthead)
      setScrolled(window.scrollY > 150);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Top bar + Masthead ── somem ao scroll ── */}
      <header
        className={`transition-all duration-500 ease-out ${
          scrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {/* Top bar - data + redes sociais + entrar */}
        <div className="hidden lg:block bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
            <div className="flex items-center gap-4">
              <span suppressHydrationWarning>
                {formattedDate || new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 text-white hover:bg-white hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 text-white hover:bg-white hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 text-white hover:bg-white hover:text-primary transition-all duration-200 hover:scale-110"
                  aria-label="X (Twitter)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/60">⏱ Última atualização: agora</span>
              <Link
                href="/login"
                className="font-bold text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>

        {/* Masthead - nome do jornal + banner */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="group shrink-0">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 group-hover:text-blue-700 transition-colors">
                <span className="text-blue-700">{firstWord}</span>{rest ? ` ${rest}` : ""}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-0.5">
                {portalTagline}
              </p>
            </Link>

            {/* Banner 728x90 ao lado do nome */}
            {banner && (
              <HeaderBanner
                imageUrl={banner.imageUrl}
                alt={banner.alt}
                linkUrl={banner.linkUrl}
              />
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation (sticky) ── fica fixo no topo ao scrollar ── */}
      <nav
        className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <ul className="flex items-center gap-1">
            <li>
              <Link
                href="/"
                className="inline-block px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-blue-700 hover:text-blue-700 transition-colors"
              >
                Home
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categorias/${cat.slug}`}
                  className="inline-block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/busca"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-3"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu (abaixo do nav sticky) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-gray-200 overflow-hidden bg-white sticky top-[49px] z-40"
          >
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-900 bg-gray-100"
              >
                Home
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="my-2 border-gray-100" />
              <Link
                href="/busca"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Entrar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
