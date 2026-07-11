import { prisma } from "../config";
import { Prisma } from "@prisma/client";
import type { ICategoryRepository } from "../types/repositories";

export class CategoryRepository implements ICategoryRepository {
  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string, portalId: string) {
    return prisma.category.findUnique({
      where: { slug_portalId: { slug, portalId } },
    });
  }

  async findMany(portalId: string, active?: boolean) {
    const where: Prisma.CategoryWhereInput = { portalId };
    if (active !== undefined) where.active = active;

    return prisma.category.findMany({
      where,
      orderBy: { order: "asc" },
    });
  }

  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  async hasNews(id: string): Promise<boolean> {
    const count = await prisma.news.count({ where: { categoryId: id } });
    return count > 0;
  }

  async count(portalId: string) {
    return prisma.category.count({ where: { portalId } });
  }
}

export const categoryRepository = new CategoryRepository();
