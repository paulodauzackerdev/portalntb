import { generateSlug } from "../utils/slug";
import sanitizeHtml from "sanitize-html";
import { badRequest, notFound, forbidden, internalError } from "../utils/error";
import { prisma } from "../config";
import { Status, Prisma } from "@prisma/client";
import crypto from "crypto";
import type { INewsRepository, ICategoryRepository, NewsWithRelations, NewsWithBasicRelations } from "../types/repositories";
import { newsRepository as defaultNewsRepo, categoryRepository as defaultCategoryRepo } from "../repositories";
import { storageProvider } from "./storage/storage-provider";

interface CreateNewsParams {
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
  authorId: string;
  portalId: string;
}

const ALLOWED_IFRAME_DOMAINS = [
  "www.youtube.com",
  "player.vimeo.com",
  "youtube.com",
  "vimeo.com",
];

function validateIframeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_DOMAINS.some(domain => url.hostname === domain);
  } catch {
    return false;
  }
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "figure", "figcaption", "iframe", "span"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "target", "rel"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen"],
    span: ["style"],
  },
  allowedSchemes: ["http", "https"],
};

function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    ...SANITIZE_OPTIONS,
    exclusiveFilter: (node) => {
      if (node.tag === 'iframe' && node.attribs?.src && !validateIframeSrc(node.attribs.src)) {
        return true;
      }
      return false;
    },
  });
}

/** Resolve a URL pública de uma imagem a partir de sua key */
function resolveCoverUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return storageProvider.getPublicUrl(key);
}

/**
 * Tipos de resposta com URL já resolvida.
 * Usado pelo controller para devolver cover_image_url (resolvida) +
 * cover_image_key (armazenada) ao frontend.
 */
export interface NewsResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  cover_image_key: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  status: string;
  published_at: Date | null;
  author: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  og_image?: string | null;
  views: number;
  is_featured: boolean;
  is_breaking: boolean;
  created_at: Date;
  updated_at?: Date;
}

/** Converte um registro do Prisma para o formato da API, resolvendo URLs */
function toNewsResponse(news: NewsWithRelations): NewsResponse {
  const coverKey = (news.coverImageKey as string) || null;
  return {
    id: news.id as string,
    title: news.title as string,
    slug: news.slug as string,
    excerpt: (news.excerpt as string) || null,
    content: news.content as string,
    cover_image_key: coverKey,
    cover_image_url: resolveCoverUrl(coverKey),
    cover_image_alt: (news.coverImageAlt as string) || null,
    status: news.status as string,
    published_at: (news.publishedAt as Date) || null,
    author: news.author as NewsResponse["author"],
    category: news.category as NewsResponse["category"],
    tags: Array.isArray(news.newsTags)
      ? (news.newsTags as Array<{ tag: { id: string; name: string; slug: string } }>).map((nt) => nt.tag)
      : [],
    seo_title: (news.seoTitle as string) || null,
    seo_description: (news.seoDescription as string) || null,
    seo_keywords: (news.seoKeywords as string) || null,
    og_image: (news.ogImage as string) || null,
    views: (news.views as number) || 0,
    is_featured: (news.isFeatured as boolean) || false,
    is_breaking: (news.isBreaking as boolean) || false,
    created_at: news.createdAt as Date,
    updated_at: news.updatedAt as Date,
  };
}

/** Versão resumida (sem content) para listagens */
function toNewsListItem(news: NewsWithBasicRelations): Omit<NewsResponse, "content"> {
  const coverKey = (news.coverImageKey as string) || null;
  return {
    id: news.id as string,
    title: news.title as string,
    slug: news.slug as string,
    excerpt: (news.excerpt as string) || null,
    cover_image_key: coverKey,
    cover_image_url: resolveCoverUrl(coverKey),
    cover_image_alt: (news.coverImageAlt as string) || null,
    status: news.status as string,
    published_at: (news.publishedAt as Date) || null,
    author: news.author as NewsResponse["author"],
    category: news.category as NewsResponse["category"],
    tags: Array.isArray(news.newsTags)
      ? (news.newsTags as Array<{ tag: { id: string; name: string; slug: string } }>).map((nt) => nt.tag)
      : [],
    views: (news.views as number) || 0,
    is_featured: (news.isFeatured as boolean) || false,
    is_breaking: (news.isBreaking as boolean) || false,
    created_at: news.createdAt as Date,
  };
}

export { toNewsResponse, toNewsListItem, resolveCoverUrl };

export class NewsService {
  constructor(
    private newsRepository: INewsRepository = defaultNewsRepo,
    private categoryRepository: ICategoryRepository = defaultCategoryRepo,
  ) {}
  private buildCreateData(data: Partial<CreateNewsParams>, slug: string, authorId: string, portalId: string) {
    return {
      title: data.title!,
      content: data.content!,
      slug,
      excerpt: data.excerpt || data.content!.substring(0, 200),
      coverImageKey: data.cover_image_key || null,
      coverImageAlt: data.cover_image_alt || null,
      seoTitle: data.seo_title || data.title,
      seoDescription: data.seo_description || data.excerpt || data.content!.substring(0, 160),
      seoKeywords: data.seo_keywords || null,
      isFeatured: data.is_featured || false,
      isBreaking: data.is_breaking || false,
      status: "DRAFT" as Status,
      author: { connect: { id: authorId } },
      portal: { connect: { id: portalId } },
      category: { connect: { id: data.category_id } },
    };
  }

  async create(params: CreateNewsParams) {
    const { tag_ids, authorId, portalId, ...data } = params;

    if (data.content) {
      data.content = sanitizeContent(data.content);
    }

    const category = await this.categoryRepository.findById(data.category_id);
    if (!category) {
      throw badRequest("Categoria não encontrada");
    }

    let slug = generateSlug(data.title);
    let attempts = 0;
    while (await this.newsRepository.findBySlug(slug, portalId)) {
      slug = `${generateSlug(data.title)}-${crypto.randomBytes(4).toString('hex')}`;
      if (++attempts > 5) {
        throw internalError("Não foi possível gerar um slug único para esta notícia");
      }
    }

    return prisma.$transaction(async (tx) => {
      const created = await tx.news.create({
        data: {
          title: data.title,
          content: data.content,
          slug,
          excerpt: data.excerpt || data.content.substring(0, 200),
          coverImageKey: data.cover_image_key || null,
          coverImageAlt: data.cover_image_alt || null,
          seoTitle: data.seo_title || data.title,
          seoDescription: data.seo_description || data.excerpt || data.content.substring(0, 160),
          seoKeywords: data.seo_keywords || null,
          isFeatured: data.is_featured || false,
          isBreaking: data.is_breaking || false,
          status: "DRAFT" as Status,
          author: { connect: { id: authorId } },
          portal: { connect: { id: portalId } },
          category: { connect: { id: data.category_id } },
        },
      });

      if (tag_ids && tag_ids.length > 0) {
        await tx.newsTag.createMany({
          data: tag_ids.map((tagId) => ({ newsId: created.id, tagId })),
        });
      }

      return created;
    });
  }

  async update(id: string, params: Partial<CreateNewsParams>, userId: string, userRole: string) {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw notFound("Notícia não encontrada");
    }

    if (userRole === "JOURNALIST" && news.authorId !== userId) {
      throw forbidden("Você só pode editar suas próprias notícias");
    }

    const { tag_ids, authorId: _authorId, portalId: _portalId, ...data } = params;

    if (data.content !== undefined && data.content !== null) {
      data.content = sanitizeContent(data.content);
    }

    const updateData: Prisma.NewsUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.cover_image_key !== undefined) updateData.coverImageKey = data.cover_image_key;
    if (data.cover_image_alt !== undefined) updateData.coverImageAlt = data.cover_image_alt;
    if (data.category_id !== undefined) updateData.category = { connect: { id: data.category_id } };
    if (data.seo_title !== undefined) updateData.seoTitle = data.seo_title;
    if (data.seo_description !== undefined) updateData.seoDescription = data.seo_description;
    if (data.seo_keywords !== undefined) updateData.seoKeywords = data.seo_keywords;
    if (data.is_featured !== undefined) updateData.isFeatured = data.is_featured;
    if (data.is_breaking !== undefined) updateData.isBreaking = data.is_breaking;

    // Atualizar slug se o título mudou
    if (data.title && data.title !== news.title) {
      let slug = generateSlug(data.title);
      const existing = await this.newsRepository.findBySlug(slug, news.portalId);
      if (existing && existing.id !== id) {
        slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
      }
      updateData.slug = slug;
    }

    // Deletar imagem antiga do R2 se a capa foi alterada
    if (data.cover_image_key && data.cover_image_key !== news.coverImageKey && news.coverImageKey) {
      await storageProvider.delete(news.coverImageKey).catch(() => {});
    }

    // Atualizar tags
    if (tag_ids !== undefined) {
      await prisma.newsTag.deleteMany({ where: { newsId: id } });
      if (tag_ids.length > 0) {
        await prisma.newsTag.createMany({
          data: tag_ids.map((tagId) => ({ newsId: id, tagId })),
        });
      }
    }

    return this.newsRepository.update(id, updateData);
  }

  async publish(id: string, userId: string, userRole: string) {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw notFound("Notícia não encontrada");
    }

    if (userRole === "JOURNALIST") {
      throw forbidden("Jornalistas não podem publicar notícias");
    }

    if (news.status === "PUBLISHED") {
      throw badRequest("Notícia já está publicada");
    }

    return this.newsRepository.publish(id);
  }

  async archive(id: string, userId: string, userRole: string) {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw notFound("Notícia não encontrada");
    }

    if (userRole === "JOURNALIST" && news.authorId !== userId) {
      throw forbidden("Você só pode arquivar suas próprias notícias");
    }

    return this.newsRepository.archive(id);
  }

  async delete(id: string, userId: string, userRole: string) {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw notFound("Notícia não encontrada");
    }

    if (userRole === "JOURNALIST") {
      if (news.authorId !== userId) {
        throw forbidden("Você só pode excluir suas próprias notícias");
      }
      if (news.status === "PUBLISHED") {
        throw badRequest("Jornalistas não podem excluir notícias publicadas");
      }
    }

    // Deletar imagem do R2 antes de remover a notícia
    if (news.coverImageKey) {
      await storageProvider.delete(news.coverImageKey).catch(() => {});
    }

    return this.newsRepository.delete(id);
  }

  async findBySlug(slug: string, portalId: string): Promise<NewsResponse> {
    const news = await this.newsRepository.findBySlug(slug, portalId);
    if (!news) {
      throw notFound("Notícia não encontrada");
    }
    return toNewsResponse(news);
  }

  /** Retorna notícias para listagem pública com URLs resolvidas */
  async findPublished(portalId: string, limit = 20): Promise<Omit<NewsResponse, "content">[]> {
    const list = await this.newsRepository.findPublished(portalId, limit);
    return list.map((item) => toNewsListItem(item));
  }
}

export const newsService = new NewsService();
