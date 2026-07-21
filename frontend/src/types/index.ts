export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  active: boolean;
  lastLoginAt?: string;
  created_at: string;
}

export interface Portal {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  order: number;
  active: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  /** Key da imagem no storage (ex: "news-images/originals/2026/07/uuid.webp") */
  cover_image_key?: string | null;
  /** URL pública já resolvida pelo backend */
  cover_image_url?: string | null;
  /** @deprecated Use cover_image_url */
  cover_image?: string | null;
  cover_image_alt?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  published_at?: string | null;
  author: { id: string; name: string; avatar?: string | null };
  category: { id: string; name: string; slug: string };
  tags: Tag[];
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image?: string | null;
  views: number;
  is_featured: boolean;
  is_breaking: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ImageItem {
  id: string;
  url: string;
  key: string;
  thumbnail_url?: string | null;
  alt?: string | null;
  caption?: string | null;
  size: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  created_at: string;
}

// ─── Payloads para mutations ──────────────────────────────────────

export interface CreateNewsPayload {
  title: string;
  content: string;
  excerpt?: string;
  cover_image_key?: string | null;
  cover_image_alt?: string | null;
  category_id: string;
  tag_ids?: string[];
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  is_featured?: boolean;
  is_breaking?: boolean;
}

export interface UpdateNewsPayload extends Partial<CreateNewsPayload> {
  id: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  order?: number;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  id: string;
}

export interface CreateTagPayload {
  name: string;
}

export interface PresignedUploadPayload {
  filename: string;
  contentType: string;
  size: number;
}

export interface PresignedUploadResult {
  /** ID UUID do registro no banco */
  id: string;
  uploadUrl: string;
  /** Key relativa no storage (ex: "news-images/originals/2026/07/uuid.webp") */
  key: string;
  /** URL pública para exibição imediata (resolvida pelo backend via R2_PUBLIC_URL) */
  imageUrl: string;
}
