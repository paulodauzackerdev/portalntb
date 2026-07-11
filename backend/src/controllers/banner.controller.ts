import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { sendSuccess, requireAuth } from "../utils";
import { bannerService as defaultBannerService } from "../services/banner.service";
import type { BannerService } from "../services/banner.service";
import { portalRepository } from "../repositories";

const upsertSchema = z.object({
  imageKey: z.string().min(1, "Key da imagem é obrigatória"),
  alt: z.string().max(200).optional().nullable(),
  linkUrl: z.string().max(500).optional().nullable().default(null),
  active: z.boolean().optional(),
});

export class BannerController {
  constructor(
    private bannerService: BannerService = defaultBannerService,
  ) {}

  /**
   * Público — retorna o banner ativo.
   */
  async getActive(request: FastifyRequest, reply: FastifyReply) {
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());
    const banner = await this.bannerService.getActive(portalId);
    return sendSuccess(reply, banner);
  }

  /**
   * Admin — retorna o banner atual com total de cliques.
   */
  async getCurrent(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const banner = await this.bannerService.getCurrent(user.portal_id);
    return sendSuccess(reply, banner);
  }

  /**
   * Admin — cria ou atualiza o banner.
   */
  async upsert(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const data = upsertSchema.parse(request.body);
    const banner = await this.bannerService.upsert(user.portal_id, data);
    return sendSuccess(reply, banner);
  }

  /**
   * Admin — remove o banner.
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    await this.bannerService.delete(user.portal_id);
    return sendSuccess(reply, { message: "Banner removido com sucesso" });
  }

  /**
   * Público — registrar clique.
   */
  async click(request: FastifyRequest, reply: FastifyReply) {
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());
    const ip = request.ip;
    const result = await this.bannerService.incrementClicks(portalId, ip);
    return sendSuccess(reply, result);
  }

  /**
   * Admin — estatísticas detalhadas do banner.
   */
  async stats(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const stats = await this.bannerService.getStats(user.portal_id);
    return sendSuccess(reply, stats);
  }

  /**
   * Admin — reseta estatísticas de clique do banner.
   */
  async resetStats(request: FastifyRequest, reply: FastifyReply) {
    const user = requireAuth(request);
    const result = await this.bannerService.resetStats(user.portal_id);
    return sendSuccess(reply, { message: "Estatísticas resetadas com sucesso", deleted: result.deleted });
  }

  private async getDefaultPortalId(): Promise<string> {
    return portalRepository.getDefaultId();
  }
}

export const bannerController = new BannerController();
