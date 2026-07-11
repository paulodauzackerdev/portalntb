import path from "path";
import { badRequest } from "../utils/error";
import { storageProvider } from "./storage/storage-provider";

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
}

export const uploadService = new UploadService();
