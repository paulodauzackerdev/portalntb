import { generateSlug } from "../utils/slug";
import { conflict, notFound } from "../utils/error";
import type { ITagRepository } from "../types/repositories";
import { tagRepository as defaultTagRepo } from "../repositories";

export class TagService {
  constructor(
    private tagRepository: ITagRepository = defaultTagRepo,
  ) {}
  async create(data: { name: string }, portalId: string) {
    const slug = generateSlug(data.name);

    // Verificar se já existe tag com mesmo slug no portal
    const existing = await this.tagRepository.findBySlug(slug, portalId);
    if (existing) {
      throw conflict("Já existe uma tag com este nome neste portal");
    }

    return this.tagRepository.create({
      ...data,
      slug,
      portal: { connect: { id: portalId } },
    });
  }

  async update(id: string, data: { name?: string }, portalId: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw notFound("Tag não encontrada");
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.name && data.name !== tag.name) {
      const slug = generateSlug(data.name);
      // Verificar se já existe outra tag com o mesmo slug no mesmo portal
      const existing = await this.tagRepository.findBySlug(slug, portalId);
      if (existing && existing.id !== id) {
        throw conflict("Já existe uma tag com este slug neste portal");
      }
      updateData.slug = slug;
    }

    return this.tagRepository.update(id, updateData);
  }

  async delete(id: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw notFound("Tag não encontrada");
    }

    return this.tagRepository.delete(id);
  }

  async getBySlug(slug: string, portalId: string) {
    return this.tagRepository.findBySlug(slug, portalId);
  }

  async list(portalId: string, search?: string) {
    return this.tagRepository.findMany(portalId, search);
  }
}

export const tagService = new TagService();
