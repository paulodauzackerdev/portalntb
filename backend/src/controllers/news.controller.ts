import { FastifyRequest, FastifyReply } from "fastify";
import { createNewsSchema, updateNewsSchema, newsQuerySchema, type NewsQueryInput } from "../schemas";
import { sendSuccess, requireAuth } from "../utils";
import { getPaginationParams, calculatePaginationMeta } from "../types";
import type { INewsRepository, IPortalRepository } from "../types/repositories";
import type { NewsService } from "../services/news.service";
import { newsService as defaultNewsService } from "../services";
import { newsRepository as defaultNewsRepo, portalRepository as defaultPortalRepo } from "../repositories";
import { toNewsListItem } from "../services/news.service";

// Cache LRU simples para deduplicar views: chave = "newsId:IP", valor = timestamp
const VIEW_DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const VIEW_CACHE_MAX_SIZE = 10000;
const viewCache = new Map<string, number>();

// Limpeza periódica do cache a cada 5 minutos (roda em intervalo, não a cada request)
function cleanupViewCache() {
  const now = Date.now();
  const cutoff = now - VIEW_DEDUP_WINDOW_MS;
  for (const [key, ts] of viewCache) {
    if (ts < cutoff) viewCache.delete(key);
  }
}
setInterval(cleanupViewCache, VIEW_DEDUP_WINDOW_MS);

export class NewsController {
  constructor(
    private newsService: NewsService = defaultNewsService,
    private newsRepository: INewsRepository = defaultNewsRepo,
    private portalRepository: IPortalRepository = defaultPortalRepo,
  ) {}
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = newsQuerySchema.parse(request.query);

    // Tenta autenticar, mas não falha se não tiver token (rota pública)
    try {
      await request.jwtVerify();
    } catch {
      // Público - sem autenticação
    }

    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());
    const { page, limit } = getPaginationParams(query as unknown as { page?: string; limit?: string });

    // Se for público (não autenticado), mostrar apenas publicadas
    const status: NewsQueryInput["status"] = request.user ? query.status : "PUBLISHED";

    const { news, total } = await this.newsRepository.findMany({
      page,
      limit,
      portalId,
      status,
      categoryId: query.category_id,
      tagId: query.tag_id,
      authorId: query.author_id,
      search: query.search,
      sort: query.sort,
      order: query.order as "asc" | "desc",
      isFeatured: query.is_featured,
      isBreaking: query.is_breaking,
    });

    // Formatar resposta com URLs resolvidas
    const data = news.map((item) => toNewsListItem(item));

    return sendSuccess(reply, data, calculatePaginationMeta(total, page, limit));
  }

  async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());

    const news = await this.newsService.findBySlug(slug, portalId);

    // Incrementar views apenas se for acesso público e não tiver visto nos últimos 5 min
    if (!request.user) {
      const ip = request.ip;
      const viewKey = `${news.id}:${ip}`;
      const lastView = viewCache.get(viewKey);
      const now = Date.now();

      if (!lastView || now - lastView > VIEW_DEDUP_WINDOW_MS) {
        await this.newsRepository.incrementViews(news.id);
        viewCache.set(viewKey, now);

        // Limpeza total se estourar o limite máximo
        if (viewCache.size > VIEW_CACHE_MAX_SIZE) {
          viewCache.clear();
        }
      }
    }

    return sendSuccess(reply, news);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    // Aceitar tanto cover_image_key (novo) quanto cover_image (legado) como entrada
    const body = request.body as Record<string, unknown>;
    const legacyCoverImage = body.cover_image as string | undefined;
    const coverImageKey = (body.cover_image_key as string) || legacyCoverImage || undefined;

    const parsed = createNewsSchema.parse({
      ...body,
      cover_image_key: coverImageKey,
    });

    const user = requireAuth(request);

    const news = await this.newsService.create({
      ...parsed,
      cover_image_key: coverImageKey || null,
      authorId: user.id,
      portalId: user.portal_id,
    });

    return sendSuccess(reply, {
      id: news.id,
      title: news.title,
      slug: news.slug,
      status: news.status,
      created_at: news.createdAt,
    }, undefined, 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    // Aceitar cover_image_key (novo) e cover_image (legado) como entrada
    const body = request.body as Record<string, unknown>;
    const legacyCoverImage = body.cover_image as string | undefined;
    const coverImageKey = (body.cover_image_key as string) || legacyCoverImage || undefined;

    const parsed = updateNewsSchema.parse({
      ...body,
      cover_image_key: coverImageKey,
    });

    const user = requireAuth(request);

    const news = await this.newsService.update(id, { ...parsed, cover_image_key: coverImageKey || null, portalId: user.portal_id }, user.id, user.role);

    return sendSuccess(reply, {
      id: news.id,
      title: news.title,
      updated_at: news.updatedAt,
    });
  }

  async publish(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = requireAuth(request);

    const news = await this.newsService.publish(id, user.id, user.role);

    return sendSuccess(reply, {
      id: news.id,
      status: news.status,
      published_at: news.publishedAt,
    });
  }

  async archive(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = requireAuth(request);

    const news = await this.newsService.archive(id, user.id, user.role);

    return sendSuccess(reply, {
      id: news.id,
      status: news.status,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = requireAuth(request);

    await this.newsService.delete(id, user.id, user.role);

    return sendSuccess(reply, {
      message: "Notícia excluída com sucesso",
    });
  }

  private getDefaultPortalId(): Promise<string> {
    return this.portalRepository.getDefaultId();
  }
}

export const newsController = new NewsController();
