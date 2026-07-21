import type { Prisma } from "@prisma/client";

// ─── Tipos retornados pelos repositórios ──────────────────────────

// Usamos os tipos do Prisma diretamente nas interfaces para manter compatibilidade.
// Idealmente seriam DTOs próprios, mas isso já elimina o acoplamento de importação.

// ─── Tipos helper para notícias com relações (usados nos services) ───

// Notícia com dados completos do autor (avatar incluso)
export type NewsWithRelations = Prisma.NewsGetPayload<{
  include: {
    author: { select: { id: true; name: true; avatar: true } };
    category: { select: { id: true; name: true; slug: true } };
    newsTags: { include: { tag: true } };
  };
}>;

// Notícia com dados básicos do autor (sem avatar) — usado em listagens
export type NewsWithBasicRelations = Prisma.NewsGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
    category: { select: { id: true; name: true; slug: true } };
    newsTags: { include: { tag: true } };
  };
}>;

export interface IUserRepository {
  findByEmail(email: string): Promise<Prisma.UserGetPayload<{ include: { role: true } }> | null>;
  findById(id: string): Promise<Prisma.UserGetPayload<{ include: { role: true; portal: true } }> | null>;
  findMany(params: {
    page: number;
    limit: number;
    search?: string;
    roleId?: string;
    active?: boolean;
    portalId: string;
  }): Promise<{ users: Prisma.UserGetPayload<{ include: { role: true } }>[]; total: number }>;
  create(data: Prisma.UserCreateInput): Promise<Prisma.UserGetPayload<{ include: { role: true } }>>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<Prisma.UserGetPayload<{ include: { role: true } }>>;
  updateLastLogin(id: string): Promise<Prisma.UserGetPayload<{}>>;
  count(portalId: string): Promise<number>;
}

export interface INewsRepository {
  findById(id: string): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true; name: true; avatar: true } }; category: { select: { id: true; name: true; slug: true } }; newsTags: { include: { tag: true } } }
  }> | null>;
  findBySlug(slug: string, portalId: string): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true; name: true; avatar: true } }; category: { select: { id: true; name: true; slug: true } }; newsTags: { include: { tag: true } } }
  }> | null>;
  findMany(params: {
    page: number;
    limit: number;
    portalId: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    isFeatured?: boolean;
    isBreaking?: boolean;
  }): Promise<{ news: Prisma.NewsGetPayload<{
    include: { author: { select: { id: true, name: true } }; category: { select: { id: true, name: true, slug: true } }; newsTags: { include: { tag: true } } }
  }>[]; total: number }>;
  create(data: Prisma.NewsCreateInput): Promise<Prisma.NewsGetPayload<{}>>;
  update(id: string, data: Prisma.NewsUpdateInput): Promise<Prisma.NewsGetPayload<{}>>;
  delete(id: string): Promise<Prisma.NewsGetPayload<{}>>;
  publish(id: string): Promise<Prisma.NewsGetPayload<{}>>;
  archive(id: string): Promise<Prisma.NewsGetPayload<{}>>;
  incrementViews(id: string): Promise<Prisma.NewsGetPayload<{}>>;
  findPublished(portalId: string, limit?: number, offset?: number): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true, name: true } }; category: { select: { id: true, name: true, slug: true } }; newsTags: { include: { tag: true } } }
  }>[]>;
  findFeatured(portalId: string): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true, name: true } }; category: { select: { id: true, name: true, slug: true } } }
  }>[]>;
  findBreaking(portalId: string): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true, name: true } }; category: { select: { id: true, name: true, slug: true } } }
  }>[]>;
  findRelated(newsId: string, categoryId: string, portalId: string, limit?: number): Promise<Prisma.NewsGetPayload<{
    include: { author: { select: { id: true, name: true } }; category: { select: { id: true, name: true, slug: true } } }
  }>[]>;
  count(portalId: string, status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"): Promise<number>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Prisma.CategoryGetPayload<{}> | null>;
  findBySlug(slug: string, portalId: string): Promise<Prisma.CategoryGetPayload<{}> | null>;
  findMany(portalId: string, active?: boolean): Promise<Prisma.CategoryGetPayload<{}>[]>;
  create(data: Prisma.CategoryCreateInput): Promise<Prisma.CategoryGetPayload<{}>>;
  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Prisma.CategoryGetPayload<{}>>;
  delete(id: string): Promise<Prisma.CategoryGetPayload<{}>>;
  hasNews(id: string): Promise<boolean>;
  count(portalId: string): Promise<number>;
}

export interface ITagRepository {
  findById(id: string): Promise<Prisma.TagGetPayload<{}> | null>;
  findBySlug(slug: string, portalId: string): Promise<Prisma.TagGetPayload<{}> | null>;
  findMany(portalId: string, search?: string): Promise<Prisma.TagGetPayload<{}>[]>;
  create(data: Prisma.TagCreateInput): Promise<Prisma.TagGetPayload<{}>>;
  update(id: string, data: Prisma.TagUpdateInput): Promise<Prisma.TagGetPayload<{}>>;
  delete(id: string): Promise<Prisma.TagGetPayload<{}>>;
  count(portalId: string): Promise<number>;
}

export interface IPortalRepository {
  findById(id: string): Promise<Prisma.PortalGetPayload<{}> | null>;
  findFirst(): Promise<Prisma.PortalGetPayload<{}> | null>;
  getDefaultId(): Promise<string>;
}

export interface IImageRepository {
  create(data: {
    key: string;
    size: number;
    mimeType: string;
    uploadedById: string;
    portalId: string;
  }): Promise<Prisma.ImageGetPayload<{}>>;
  findById(id: string): Promise<Prisma.ImageGetPayload<{}> | null>;
  findByPortal(portalId: string): Promise<Prisma.ImageGetPayload<{}>[]>;
  update(id: string, data: { alt?: string | null; caption?: string | null }): Promise<Prisma.ImageGetPayload<{}>>;
  delete(id: string): Promise<Prisma.ImageGetPayload<{}>>;
}
