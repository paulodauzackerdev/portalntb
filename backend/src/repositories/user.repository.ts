import { prisma } from "../config";
import { Prisma } from "@prisma/client";
import type { IUserRepository } from "../types/repositories";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true, portal: true },
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    search?: string;
    roleId?: string;
    active?: boolean;
    portalId: string;
  }) {
    const { page, limit, search, roleId, active, portalId } = params;
    const where: Prisma.UserWhereInput = { portalId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleId) where.roleId = roleId;
    if (active !== undefined) where.active = active;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, include: { role: true } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async count(portalId: string) {
    return prisma.user.count({ where: { portalId } });
  }
}

export const userRepository = new UserRepository();
