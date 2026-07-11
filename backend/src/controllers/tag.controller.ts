import { FastifyRequest, FastifyReply } from "fastify";
import { createTagSchema, updateTagSchema } from "../schemas";
import { sendSuccess, requireAuth } from "../utils";
import type { IPortalRepository } from "../types/repositories";
import type { TagService } from "../services/tag.service";
import { tagService as defaultTagService } from "../services";
import { portalRepository as defaultPortalRepo } from "../repositories";

export class TagController {
  constructor(
    private tagService: TagService = defaultTagService,
    private portalRepository: IPortalRepository = defaultPortalRepo,
  ) {}
  async list(request: FastifyRequest, reply: FastifyReply) {
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());
    const query = request.query as { search?: string };

    const tags = await this.tagService.list(portalId, query.search);

    return sendSuccess(reply, tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })));
  }

  async getBySlug(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = request.params as { slug: string };
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());

    const tag = await this.tagService.getBySlug(slug, portalId);
    if (!tag) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Tag não encontrada" },
      });
    }

    return sendSuccess(reply, {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createTagSchema.parse(request.body);
    const portalId = requireAuth(request).portal_id;

    const tag = await this.tagService.create(data, portalId);

    return sendSuccess(reply, {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    }, undefined, 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateTagSchema.parse(request.body);
    const portalId = requireAuth(request).portal_id;

    const tag = await this.tagService.update(id, data, portalId);

    return sendSuccess(reply, {
      id: tag.id,
      name: tag.name,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    await this.tagService.delete(id);

    return sendSuccess(reply, {
      message: "Tag excluída com sucesso",
    });
  }

  private getDefaultPortalId(): Promise<string> {
    return this.portalRepository.getDefaultId();
  }
}

export const tagController = new TagController();
