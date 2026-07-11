import { FastifyRequest, FastifyReply } from "fastify";
import { sendSuccess, requireAuth } from "../utils";
import { z } from "zod";
import type { PortalService } from "../services/portal.service";
import { portalService as defaultPortalService } from "../services/portal.service";
import { portalRepository } from "../repositories";

const updateSettingsSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().nullable(),
});

export class PortalController {
  constructor(
    private portalService: PortalService = defaultPortalService,
  ) {}
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const portal = await this.portalService.getSettings(user.portal_id);
    return sendSuccess(reply, {
      id: portal.id,
      name: portal.name,
      slug: portal.slug,
      description: portal.description,
      logo: portal.logo,
    });
  }

  /** Rota pública — retorna dados básicos do primeiro portal ativo */
  async getPublicInfo(request: FastifyRequest, reply: FastifyReply) {
    const portal = await portalRepository.findFirst();
    if (!portal) {
      return reply.status(404).send({ success: false, error: { code: "NOT_FOUND", message: "Portal não encontrado" } });
    }
    return sendSuccess(reply, {
      name: portal.name,
      slug: portal.slug,
      description: portal.description,
      logo: portal.logo,
    });
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const data = updateSettingsSchema.parse(request.body);
    const portal = await this.portalService.updateSettings(user.portal_id, data);
    return sendSuccess(reply, {
      id: portal.id,
      name: portal.name,
      description: portal.description,
      logo: portal.logo,
    });
  }
}

export const portalController = new PortalController();
