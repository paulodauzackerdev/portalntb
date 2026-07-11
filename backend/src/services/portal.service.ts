import { prisma } from "../config";
import { notFound } from "../utils/error";

export class PortalService {
  async getSettings(portalId: string) {
    const portal = await prisma.portal.findUnique({ where: { id: portalId } });
    if (!portal) throw notFound("Portal não encontrado");
    return portal;
  }

  async updateSettings(portalId: string, data: { name?: string; description?: string; logo?: string | null }) {
    return prisma.portal.update({ where: { id: portalId }, data });
  }
}

export const portalService = new PortalService();
