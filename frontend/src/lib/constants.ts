/**
 * URLs centralizadas para API e Site.
 *
 * Server Components (SSR/ISR): usam process.env.API_URL (http://backend:3001 no Docker)
 * Client Components (browser): usam NEXT_PUBLIC_API_URL (http://localhost:3001 no dev)
 */
export const API_URL = typeof window === "undefined"
  ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1");

export const API_BASE_URL = API_URL.replace("/api/v1", "");
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
