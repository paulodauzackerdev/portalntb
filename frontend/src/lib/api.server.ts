/**
 * Cliente HTTP para Server Components (Next.js SSR/ISR/SSG).
 * Não usa sessionStorage nem token — endpoints públicos apenas.
 */
import { API_URL } from "./constants";
const FETCH_TIMEOUT = 5000; // 5 segundos

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // Cache é controlado pela página (revalidate/force-dynamic)
      // Não definir next.revalidate aqui para evitar conflito
    });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
