import { prisma } from "../config";
import { internalError } from "../utils/error";
import type { IPortalRepository } from "../types/repositories";

// Cache com TTL para evitar queries repetidas de getDefaultId
let cachedDefaultId: string | null = null;
let cachedDefaultIdTimestamp = 0;
const DEFAULT_ID_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export class PortalRepository implements IPortalRepository {
  async findById(id: string) {
    return prisma.portal.findUnique({ where: { id } });
  }

  async findFirst() {
    return prisma.portal.findFirst({ where: { active: true } });
  }

  async getDefaultId(): Promise<string> {
    const now = Date.now();
    if (cachedDefaultId && (now - cachedDefaultIdTimestamp) < DEFAULT_ID_CACHE_TTL) {
      return cachedDefaultId;
    }
    const portal = await this.findFirst();
    if (!portal?.id) {
      throw internalError("Nenhum portal ativo encontrado. Contate o administrador.");
    }
    cachedDefaultId = portal.id;
    cachedDefaultIdTimestamp = now;
    return portal.id;
  }
}

export const portalRepository = new PortalRepository();
