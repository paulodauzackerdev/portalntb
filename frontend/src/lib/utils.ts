import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}

// ─── Portal config (centralizada via .env) ───────────────────
// Valores lidos das variáveis de ambiente NEXT_PUBLIC_*.
// O nome real do portal também vem do banco (portals.name),
// mas estes fallbacks garantem consistência antes do load.

const getEnv = (key: string, fallback: string) =>
  (typeof process !== "undefined" && process.env?.[key]) || fallback;

export const PORTAL_NAME = getEnv("NEXT_PUBLIC_PORTAL_NAME", "Portal");
export const PORTAL_DISPLAY_NAME = getEnv("NEXT_PUBLIC_PORTAL_NAME", "Portal");
export const PORTAL_TAGLINE = getEnv("NEXT_PUBLIC_PORTAL_TAGLINE", "");
export const PORTAL_DESCRIPTION = getEnv("NEXT_PUBLIC_PORTAL_DESCRIPTION", "");
export const PORTAL_METADATA_TITLE = getEnv("NEXT_PUBLIC_PORTAL_NAME", "Portal");
export const PORTAL_METADATA_DESCRIPTION = getEnv("NEXT_PUBLIC_PORTAL_DESCRIPTION", "");

// helpers para exibir nome com destaque na primeira parte
export function splitPortalName(name: string): [string, string] {
  const idx = name.indexOf(" ");
  if (idx === -1) return [name, ""];
  return [name.slice(0, idx), name.slice(idx + 1)];
}
