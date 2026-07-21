import path from "path";
import { badRequest, notFound, forbidden } from "../utils/error";
import { storageProvider } from "./storage/storage-provider";
import type { IImageRepository } from "../types/repositories";
import { imageRepository as defaultImageRepo } from "../repositories";

// Mapeamento de extensões permitidas por content type
const ALLOWED_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

const ALLOWED_EXTENSIONS = Object.values(ALLOWED_TYPES).flat();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class UploadService {
  constructor(private imageRepository: IImageRepository = defaultImageRepo) {}

  async generatePresignedUrl(filename: string, contentType: string, size: number) {
    // Validar tamanho do arquivo
    if (size > MAX_FILE_SIZE) {
      const maxMB = MAX_FILE_SIZE / (1024 * 1024);
      throw badRequest(`Arquivo muito grande. Tamanho máximo: ${maxMB}MB`);
    }

    // Validar extensão do arquivo
    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw badRequest(`Extensão "${ext}" não permitida. Aceitas: ${ALLOWED_EXTENSIONS.join(", ")}`);
    }

    // Validar se a extensão corresponde ao content type informado
    const allowedExtsForType = ALLOWED_TYPES[contentType];
    if (!allowedExtsForType || !allowedExtsForType.includes(ext)) {
      throw badRequest(`Content type "${contentType}" não corresponde à extensão "${ext}"`);
    }

    const { uploadUrl, key } = await storageProvider.generatePresignedUpload(filename, contentType);

    return {
      uploadUrl,
      key,
      /** URL pública para exibição imediata no frontend */
      imageUrl: storageProvider.getPublicUrl(key),
    };
  }

  async updateImage(id: string, data: { alt?: string | null; caption?: string | null }, userId: string, userRole: string) {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw notFound("Imagem não encontrada");
    }

    // Permissão: só o uploader ou ADMIN/EDITOR podem alterar
    if (image.uploadedById !== userId && userRole !== "ADMIN" && userRole !== "EDITOR") {
      throw forbidden("Você só pode alterar imagens enviadas por você");
    }

    const updated = await this.imageRepository.update(id, data);
    return {
      id: updated.id,
      key: updated.key,
      url: storageProvider.getPublicUrl(updated.key || updated.url),
      alt: updated.alt,
      caption: updated.caption,
      size: updated.size,
      mimeType: updated.mimeType,
      created_at: updated.createdAt,
    };
  }

  async deleteImage(id: string, userId: string, userRole: string) {
    const image = await this.imageRepository.findById(id);
    if (!image) {
      throw notFound("Imagem não encontrada");
    }

    // Permissão: só o uploader ou ADMIN/EDITOR podem deletar
    if (image.uploadedById !== userId && userRole !== "ADMIN" && userRole !== "EDITOR") {
      throw forbidden("Você só pode excluir imagens enviadas por você");
    }

    // Verificar se a imagem está vinculada a alguma notícia
    const newsCount = await this.imageRepository.findNewsCountByImageKey(image.key);
    if (newsCount > 0) {
      const msg = newsCount === 1
        ? "Esta imagem está sendo usada em 1 notícia. Remova o vínculo antes de excluir."
        : `Esta imagem está sendo usada em ${newsCount} notícias. Remova o vínculo antes de excluir.`;
      throw badRequest(msg);
    }

    // Deleta do R2 e do banco
    await storageProvider.delete(image.key).catch(() => {});
    await this.imageRepository.delete(id);

    return { message: "Imagem removida com sucesso" };
  }
}

export const uploadService = new UploadService();
