import { prisma } from "../config";
import type { IImageRepository } from "../types/repositories";

export class ImageRepository implements IImageRepository {
  async create(data: {
    key: string;
    size: number;
    mimeType: string;
    uploadedById: string;
    portalId: string;
  }) {
    return prisma.image.create({
      data: {
        url: data.key,
        key: data.key,
        size: data.size,
        mimeType: data.mimeType,
        uploadedById: data.uploadedById,
        portalId: data.portalId,
      },
    });
  }

  async findById(id: string) {
    return prisma.image.findUnique({ where: { id } });
  }

  async findByPortal(portalId: string) {
    return prisma.image.findMany({
      where: { portalId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async findNewsCountByImageKey(key: string) {
    return prisma.news.count({ where: { coverImageKey: key } });
  }

  async update(id: string, data: { alt?: string | null; caption?: string | null }) {
    return prisma.image.update({
      where: { id },
      data: {
        ...(data.alt !== undefined && { alt: data.alt }),
        ...(data.caption !== undefined && { caption: data.caption }),
      },
    });
  }

  async delete(id: string) {
    return prisma.image.delete({ where: { id } });
  }
}

export const imageRepository = new ImageRepository();
