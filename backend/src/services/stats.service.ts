import { newsRepository as defaultNewsRepo } from "../repositories";
import { categoryRepository as defaultCategoryRepo } from "../repositories";
import { tagRepository as defaultTagRepo } from "../repositories";
import { userRepository as defaultUserRepo } from "../repositories";
import type { INewsRepository, ICategoryRepository, ITagRepository, IUserRepository } from "../types/repositories";

export interface DashboardStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  recentNews: {
    id: string;
    title: string;
    slug: string;
    status: string;
    published_at: Date | null;
    created_at: Date;
    author: { name: string };
    category: { name: string };
  }[];
}

export class StatsService {
  constructor(
    private newsRepository: INewsRepository = defaultNewsRepo,
    private categoryRepository: ICategoryRepository = defaultCategoryRepo,
    private tagRepository: ITagRepository = defaultTagRepo,
    private userRepository: IUserRepository = defaultUserRepo,
  ) {}

  async getDashboard(portalId: string): Promise<DashboardStats> {
    const [totalNews, publishedNews, draftNews, totalCategories, totalTags, totalUsers, recentNews] =
      await Promise.all([
        this.newsRepository.count(portalId),
        this.newsRepository.count(portalId, "PUBLISHED"),
        this.newsRepository.count(portalId, "DRAFT"),
        this.categoryRepository.count(portalId),
        this.tagRepository.count(portalId),
        this.userRepository.count(portalId),
        this.newsRepository.findPublished(portalId, 5),
      ]);

    return {
      totalNews,
      publishedNews,
      draftNews,
      totalCategories,
      totalTags,
      totalUsers,
      recentNews: recentNews.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        status: n.status,
        published_at: n.publishedAt,
        created_at: n.createdAt,
        author: { name: n.author?.name || "" },
        category: { name: n.category?.name || "" },
      })),
    };
  }
}

export const statsService = new StatsService();
