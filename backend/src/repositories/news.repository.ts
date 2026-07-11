import { prisma } from "../config";
import { Prisma, Status } from "@prisma/client";
import type { INewsRepository } from "../types/repositories";

interface FindManyParams {
  page: number;
  limit: number;
  portalId: string;
  status?: Status;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  isFeatured?: boolean;
  isBreaking?: boolean;
}

export class NewsRepository implements INewsRepository {
  async findById(id: string) {
    return prisma.news.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        newsTags: { include: { tag: true } },
      },
    });
  }

  async findBySlug(slug: string, portalId: string) {
    return prisma.news.findUnique({
      where: { slug_portalId: { slug, portalId } },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        newsTags: { include: { tag: true } },
      },
    });
  }

  async findMany(params: FindManyParams) {
    const { page, limit, portalId, status, categoryId, tagId, authorId, search, sort, order, isFeatured, isBreaking } = params;
    const where: Prisma.NewsWhereInput = { portalId };

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isBreaking !== undefined) where.isBreaking = isBreaking;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tagId) {
      where.newsTags = { some: { tagId } };
    }

    const safeOrder: "asc" | "desc" = order === "asc" || order === "desc" ? order : "desc";
    const orderBy: Prisma.NewsOrderByWithRelationInput = {};
    if (sort === "publishedAt") orderBy.publishedAt = safeOrder;
    else if (sort === "title") orderBy.title = safeOrder;
    else orderBy.createdAt = safeOrder;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          newsTags: { include: { tag: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.news.count({ where }),
    ]);

    return { news, total };
  }

  async create(data: Prisma.NewsCreateInput) {
    return prisma.news.create({ data });
  }

  async update(id: string, data: Prisma.NewsUpdateInput) {
    return prisma.news.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.newsTag.deleteMany({ where: { newsId: id } });
      return tx.news.delete({ where: { id } });
    });
  }

  async publish(id: string) {
    return prisma.news.update({
      where: { id },
      data: {
        status: "PUBLISHED" as Status,
        publishedAt: new Date(),
      },
    });
  }

  async archive(id: string) {
    return prisma.news.update({
      where: { id },
      data: { status: "ARCHIVED" as Status },
    });
  }

  async incrementViews(id: string) {
    return prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async findPublished(portalId: string, limit = 20, offset?: number) {
    return prisma.news.findMany({
      where: { portalId, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        newsTags: { include: { tag: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findFeatured(portalId: string) {
    return prisma.news.findMany({
      where: { portalId, status: "PUBLISHED", isFeatured: true },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });
  }

  async findBreaking(portalId: string) {
    return prisma.news.findMany({
      where: { portalId, status: "PUBLISHED", isBreaking: true },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });
  }

  async findRelated(newsId: string, categoryId: string, portalId: string, limit = 4) {
    return prisma.news.findMany({
      where: {
        portalId,
        status: "PUBLISHED",
        categoryId,
        id: { not: newsId },
      },
      include: {
        author: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  async count(portalId: string, status?: Status) {
    const where: Prisma.NewsWhereInput = { portalId };
    if (status) where.status = status;
    return prisma.news.count({ where });
  }
}

export const newsRepository = new NewsRepository();
