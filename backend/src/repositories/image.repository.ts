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

  async findByPortal(portalId: string) {
    return prisma.image.findMany({
      where: { portalId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}

export const imageRepository = new ImageRepository();
