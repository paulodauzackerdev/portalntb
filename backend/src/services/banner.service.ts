import { prisma } from "../config";
import { notFound } from "../utils/error";
import { storageProvider } from "./storage/storage-provider";

export interface BannerData {
  id: string;
  imageKey: string;
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
  active: boolean;
  portalId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerStats {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  uniqueIps: number;
  clicksByDay: { date: string; count: number }[];
}

export interface UpsertBannerInput {
  imageKey: string;
  alt?: string | null;
  linkUrl?: string | null;
  active?: boolean;
}

function toBannerResponse(banner: {
  id: string;
  imageKey: string;
  alt: string | null;
  linkUrl: string | null;
  active: boolean;
  portalId: string;
  createdAt: Date;
  updatedAt: Date;
}): BannerData {
  return {
    ...banner,
    imageUrl: storageProvider.getPublicUrl(banner.imageKey),
  };
}

export class BannerService {
  /**
   * Retorna o banner ativo do portal (para exibição pública).
   */
  async getActive(portalId: string): Promise<BannerData | null> {
    const banner = await prisma.banner.findFirst({
      where: { portalId, active: true },
      orderBy: { updatedAt: "desc" },
    });
    return banner ? toBannerResponse(banner) : null;
  }

  /**
   * Retorna o banner atual (para o admin gerenciar).
   */
  async getCurrent(portalId: string): Promise<(BannerData & { totalClicks: number }) | null> {
    const banner = await prisma.banner.findFirst({
      where: { portalId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { clicks: true } },
      },
    });
    if (!banner) return null;
    const { _count, ...rest } = banner;
    return { ...toBannerResponse(rest), totalClicks: _count.clicks };
  }

  /**
   * Cria ou atualiza o banner do portal.
   * Se já existir, deleta a imagem antiga do storage antes de atualizar.
   */
  async upsert(portalId: string, input: UpsertBannerInput): Promise<BannerData> {
    const existing = await prisma.banner.findFirst({
      where: { portalId },
      orderBy: { updatedAt: "desc" },
    });

    const imageUrl = storageProvider.getPublicUrl(input.imageKey);
    const data = {
      imageKey: input.imageKey,
      imageUrl,
      alt: input.alt ?? null,
      linkUrl: input.linkUrl ?? null,
      active: input.active ?? true,
      portalId,
    };

    if (existing) {
      // Apenas atualiza o registro — imagem antiga permanece no R2
      const updated = await prisma.banner.update({
        where: { id: existing.id },
        data,
      });
      return toBannerResponse(updated);
    }

    const created = await prisma.banner.create({ data });
    return toBannerResponse(created);
  }

  /**
   * Remove o banner, a imagem do R2 e o registro da galeria de uploads.
   * Os clicks são removidos automaticamente via onDelete: Cascade.
   */
  async delete(portalId: string): Promise<void> {
    const banner = await prisma.banner.findFirst({
      where: { portalId },
      orderBy: { updatedAt: "desc" },
    });
    if (!banner) throw notFound("Nenhum banner encontrado");

    // Remove a imagem do R2 e da galeria de uploads
    if (banner.imageKey) {
      await storageProvider.delete(banner.imageKey).catch(() => {});
      await prisma.image.deleteMany({ where: { key: banner.imageKey } }).catch(() => {});
    }

    await prisma.banner.delete({ where: { id: banner.id } });
  }

  /**
   * Registra um clique no banner.
   * Ignora cliques duplicados do mesmo IP dentro de 5 minutos.
   */
  async incrementClicks(portalId: string, ip?: string): Promise<{ registered: boolean }> {
    const banner = await prisma.banner.findFirst({
      where: { portalId, active: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!banner) return { registered: false };

    // Verifica se o mesmo IP já clicou nos últimos 5 minutos
    if (ip) {
      const recent = await prisma.bannerClick.findFirst({
        where: {
          bannerId: banner.id,
          ip,
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
      });
      if (recent) return { registered: false };
    }

    await prisma.bannerClick.create({
      data: {
        bannerId: banner.id,
        ip: ip ?? null,
      },
    });

    return { registered: true };
  }

  /**
   * Reseta todas as estatísticas de clique do banner.
   */
  async resetStats(portalId: string): Promise<{ deleted: number }> {
    const banner = await prisma.banner.findFirst({
      where: { portalId },
      orderBy: { updatedAt: "desc" },
    });
    if (!banner) return { deleted: 0 };

    const result = await prisma.bannerClick.deleteMany({
      where: { bannerId: banner.id },
    });

    return { deleted: result.count };
  }

  /**
   * Retorna estatísticas detalhadas de cliques do banner.
   */
  async getStats(portalId: string): Promise<BannerStats | null> {
    const banner = await prisma.banner.findFirst({
      where: { portalId },
      orderBy: { updatedAt: "desc" },
    });
    if (!banner) return null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Início da semana como segunda-feira (padrão brasileiro)
    const startOfWeek = new Date(startOfDay);
    const dayOfWeek = startOfWeek.getDay(); // 0=domingo, 1=segunda...
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalClicks, clicksToday, clicksThisWeek, uniqueIps, clicksByDay] =
      await Promise.all([
        prisma.bannerClick.count({ where: { bannerId: banner.id } }),
        prisma.bannerClick.count({
          where: { bannerId: banner.id, createdAt: { gte: startOfDay } },
        }),
        prisma.bannerClick.count({
          where: { bannerId: banner.id, createdAt: { gte: startOfWeek } },
        }),
        prisma.bannerClick.findMany({
          where: { bannerId: banner.id, ip: { not: null } },
          select: { ip: true },
          distinct: ["ip"],
        }).then((rows) => rows.length),
        // Usamos findMany + groupBy no JS em vez de raw query para compatibilidade
        prisma.bannerClick.findMany({
          where: { bannerId: banner.id, createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        }).then((rows) => {
          const map = new Map<string, number>();
          for (const r of rows) {
            // Usa a data local no formato YYYY-MM-DD
            const d = r.createdAt;
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const date = `${y}-${m}-${day}`;
            map.set(date, (map.get(date) || 0) + 1);
          }
          return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
        }),
      ]);

    return {
      totalClicks,
      clicksToday,
      clicksThisWeek,
      uniqueIps,
      clicksByDay,
    };
  }
}

export const bannerService = new BannerService();
