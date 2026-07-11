import { API_BASE_URL } from "./constants";

/**
 * Utilitário para resolver URLs de imagens.
 *
 * Como a URL pública depende do R2_PUBLIC_URL (configurada no backend),
 * o frontend precisa de uma forma consistente de resolver keys em URLs.
 *
 * Estratégia: sempre que possível, usar cover_image_url devolvida pelo backend.
 * Para preview imediato após upload (antes de salvar a notícia),
 * usamos um fallback baseado na API_URL.
 *
 * No futuro, quando o frontend tiver acesso ao R2_PUBLIC_URL via env,
 * podemos resolver diretamente aqui.
 */

/**
 * O backend já resolve cover_image_url nas respostas de API.
 * Este helper serve para:
 * 1. Preview imediato após upload (antes de salvar)
 * 2. Fallback seguro caso o backend não tenha resolvido
 */
export function getImageUrl(keyOrUrl: string | null | undefined): string | null {
  if (!keyOrUrl) return null;

  // Se já é URL absoluta, retorna direto
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    return keyOrUrl;
  }

  // Se parece uma key relativa (ex: "news-images/..."), tenta montar URL
  // O backend resolve via R2_PUBLIC_URL, mas em dev podemos tentar
  // construir a URL a partir da API_URL
  if (keyOrUrl.startsWith("news-images/") || keyOrUrl.startsWith("avatars/")) {
    // Fallback: montar URL a partir da API_BASE_URL
    return `${API_BASE_URL}/${keyOrUrl}`;
  }

  // Qualquer outra string, retorna como está
  return keyOrUrl;
}

/**
 * Extrai a URL da capa de um NewsItem com fallback.
 * Prioriza cover_image_url (resolvido pelo backend).
 * Depois tenta cover_image (legado).
 * Depois tenta resolver cover_image_key manualmente.
 */
export function getCoverImageUrl(news: {
  cover_image_url?: string | null;
  cover_image?: string | null;
  cover_image_key?: string | null;
}): string | null {
  return getImageUrl(news.cover_image_url || news.cover_image || news.cover_image_key);
}
