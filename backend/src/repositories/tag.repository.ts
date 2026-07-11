import { prisma } from "../config";
import { Prisma } from "@prisma/client";
import type { ITagRepository } from "../types/repositories";

export class TagRepository implements ITagRepository {
  async findById(id: string) {
    return prisma.tag.findUnique({ where: { id } });
  }

  async findBySlug(slug: string, portalId: string) {
    return prisma.tag.findUnique({
      where: { slug_portalId: { slug, portalId } },
    });
  }

  async findMany(portalId: string, search?: string) {
    const where: Prisma.TagWhereInput = { portalId };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    return prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async create(data: Prisma.TagCreateInput) {
    return prisma.tag.create({ data });
  }

  async update(id: string, data: Prisma.TagUpdateInput) {
    return prisma.tag.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.newsTag.deleteMany({ where: { tagId: id } });
      return tx.tag.delete({ where: { id } });
    });
  }

  async count(portalId: string) {
    return prisma.tag.count({ where: { portalId } });
  }
}

export const tagRepository = new TagRepository();
