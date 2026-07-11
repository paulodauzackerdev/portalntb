import { FastifyRequest, FastifyReply } from "fastify";
import { createCategorySchema, updateCategorySchema } from "../schemas";
import { sendSuccess, requireAuth } from "../utils";
import type { IPortalRepository } from "../types/repositories";
import type { CategoryService } from "../services/category.service";
import { categoryService as defaultCategoryService } from "../services";
import { portalRepository as defaultPortalRepo } from "../repositories";

export class CategoryController {
  constructor(
    private categoryService: CategoryService = defaultCategoryService,
    private portalRepository: IPortalRepository = defaultPortalRepo,
  ) {}
  async list(request: FastifyRequest, reply: FastifyReply) {
    const portalId = request.user?.portal_id || (await this.getDefaultPortalId());
    const query = request.query as { active?: string };
    const active = query.active !== undefined ? query.active === "true" : undefined;

    const categories = await this.categoryService.list(portalId, active);

    return sendSuccess(reply, categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent_id: cat.parentId,
      order: cat.order,
      active: cat.active,
    })));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCategorySchema.parse(request.body);
    const portalId = requireAuth(request).portal_id;

    const category = await this.categoryService.create(data, portalId);

    return sendSuccess(reply, {
      id: category.id,
      name: category.name,
      slug: category.slug,
    }, undefined, 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateCategorySchema.parse(request.body);
    const portalId = requireAuth(request).portal_id;

    const category = await this.categoryService.update(id, data, portalId);

    return sendSuccess(reply, {
      id: category.id,
      name: category.name,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    await this.categoryService.delete(id);

    return sendSuccess(reply, {
      message: "Categoria excluída com sucesso",
    });
  }

  private getDefaultPortalId(): Promise<string> {
    return this.portalRepository.getDefaultId();
  }
}

export const categoryController = new CategoryController();
