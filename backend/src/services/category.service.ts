import { generateSlug } from "../utils/slug";
import { badRequest, conflict, notFound } from "../utils/error";
import { prisma } from "../config";
import type { ICategoryRepository } from "../types/repositories";
import { categoryRepository as defaultCategoryRepo } from "../repositories";

export class CategoryService {
  constructor(
    private categoryRepository: ICategoryRepository = defaultCategoryRepo,
  ) {}
  async create(data: { name: string; description?: string | null; order?: number; active?: boolean }, portalId: string) {
    const slug = generateSlug(data.name);

    // Verificar se já existe categoria com mesmo slug no portal
    const existing = await this.categoryRepository.findBySlug(slug, portalId);
    if (existing) {
      throw conflict("Já existe uma categoria com este nome neste portal");
    }

    return this.categoryRepository.create({
      ...data,
      slug,
      portal: { connect: { id: portalId } },
    });
  }

  async update(id: string, data: { name?: string; description?: string | null; order?: number; active?: boolean }, portalId: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw notFound("Categoria não encontrada");
    }

    // Se mudou o nome, atualizar slug
    const updateData: Record<string, unknown> = { ...data };
    if (data.name && data.name !== category.name) {
      const slug = generateSlug(data.name);
      const existing = await this.categoryRepository.findBySlug(slug, portalId);
      if (existing && existing.id !== id) {
        throw conflict("Já existe uma categoria com este nome neste portal");
      }
      updateData.slug = slug;
    }

    return this.categoryRepository.update(id, updateData);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw notFound("Categoria não encontrada");
    }

    // Verificar se há subcategorias
    const hasChildren = await prisma.category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw badRequest("Não é possível excluir categoria com subcategorias. Remova ou reatribua as subcategorias primeiro.");
    }

    // Verificar se há notícias vinculadas
    const hasNews = await this.categoryRepository.hasNews(id);
    if (hasNews) {
      throw badRequest("Não é possível excluir categoria com notícias vinculadas. Reatribua as notícias primeiro.");
    }

    return this.categoryRepository.delete(id);
  }

  async list(portalId: string, active?: boolean) {
    return this.categoryRepository.findMany(portalId, active);
  }
}

export const categoryService = new CategoryService();
