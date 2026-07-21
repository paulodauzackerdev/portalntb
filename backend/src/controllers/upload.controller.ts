import { FastifyRequest, FastifyReply } from "fastify";
import { presignedUploadSchema, updateImageSchema, imageIdParams } from "../schemas";
import { sendSuccess, requireAuth } from "../utils";
import type { IImageRepository } from "../types/repositories";
import type { UploadService } from "../services/upload.service";
import { uploadService as defaultUploadService } from "../services";
import { imageRepository as defaultImageRepo } from "../repositories";
import { storageProvider } from "../services/storage/storage-provider";

export class UploadController {
  constructor(
    private uploadService: UploadService = defaultUploadService,
    private imageRepository: IImageRepository = defaultImageRepo,
  ) {}
  async generatePresignedUrl(request: FastifyRequest, reply: FastifyReply) {
    const data = presignedUploadSchema.parse(request.body);
    const user = requireAuth(request);

    const result = await this.uploadService.generatePresignedUrl(
      data.filename,
      data.contentType,
      data.size
    );

    // Salvar metadados da imagem no banco
    await this.imageRepository.create({
      key: result.key,
      size: data.size,
      mimeType: data.contentType,
      uploadedById: user.id,
      portalId: user.portal_id,
    });

    return sendSuccess(reply, result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const images = await this.imageRepository.findByPortal(user.portal_id);

    return sendSuccess(reply, images.map((img) => ({
      id: img.id,
      url: storageProvider.getPublicUrl(img.key || img.url),
      key: img.key,
      alt: img.alt,
      caption: img.caption,
      size: img.size,
      mimeType: img.mimeType,
      created_at: img.createdAt,
    })));
  }

  async updateImage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = imageIdParams.parse(request.params);
    const data = updateImageSchema.parse(request.body);
    const user = requireAuth(request);

    const result = await this.uploadService.updateImage(id, data, user.id, user.role);

    return sendSuccess(reply, result);
  }

  async deleteImage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = imageIdParams.parse(request.params);
    const user = requireAuth(request);

    const result = await this.uploadService.deleteImage(id, user.id, user.role);

    return sendSuccess(reply, result);
  }
}

export const uploadController = new UploadController();
