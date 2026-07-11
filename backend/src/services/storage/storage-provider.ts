import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import crypto from "crypto";
import path from "path";

export const STORAGE_PATHS = {
  originals: "news-images/originals",
  avatars: "avatars",
} as const;

export interface PresignedUploadResult {
  uploadUrl: string;
  /** Apenas a key relativa: "news-images/originals/2026/07/uuid.webp" */
  key: string;
}

export class StorageProvider {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;
  private presignedExpiresIn: number;

  constructor() {
    this.s3 = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY || "",
        secretAccessKey: env.R2_SECRET_KEY || "",
      },
      forcePathStyle: true,
    });
    this.bucket = env.R2_BUCKET || "cms-images";
    this.publicUrl = env.R2_PUBLIC_URL || "";
    this.presignedExpiresIn = env.PRESIGNED_URL_EXPIRY || 900; // 15 minutos
  }

  /**
   * Gera uma URL assinada para upload direto (browser → R2).
   * Retorna a URL de upload e a key do arquivo.
   */
  async generatePresignedUpload(
    filename: string,
    contentType: string,
    folder: string = STORAGE_PATHS.originals
  ): Promise<PresignedUploadResult> {
    const ext = path.extname(filename);
    const key = this.generateKey(ext, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.presignedExpiresIn,
    });

    return { uploadUrl, key };
  }

  /**
   * Retorna a URL pública completa a partir de uma key.
   * Ex: "news-images/originals/2026/07/uuid.webp"
   *   → "https://pub.r2.dev/news-images/originals/2026/07/uuid.webp"
   */
  getPublicUrl(key: string): string {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) return key; // já é URL absoluta
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/+$/, "")}/${key}`;
    }
    // Fallback: caminho relativo (útil em dev sem R2 configurado)
    return `/${key}`;
  }

  /**
   * Deleta um objeto do storage.
   */
  async delete(key: string): Promise<void> {
    if (!key) return;
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  /**
   * Gera um path único no formato: folder/YYYY/MM/uuid.ext
   */
  private generateKey(ext: string, folder: string): string {
    const uuid = crypto.randomUUID();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${folder}/${year}/${month}/${uuid}${ext}`;
  }
}

// Singleton
export const storageProvider = new StorageProvider();
