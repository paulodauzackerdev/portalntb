import { FastifyRequest, FastifyReply } from "fastify";
import { createUserSchema, updateUserSchema, updateProfileSchema, changePasswordSchema } from "../schemas";
import { sendSuccess, requireAuth, badRequest } from "../utils";
import { getPaginationParams, calculatePaginationMeta } from "../types";
import type { UserService } from "../services/user.service";
import { userService as defaultUserService } from "../services";

export class UserController {
  constructor(
    private userService: UserService = defaultUserService,
  ) {}
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as {
      page?: string;
      limit?: string;
      search?: string;
      role_id?: string;
      active?: string;
    };
    const user = requireAuth(request);
    const portalId = user.portal_id;
    const { page, limit } = getPaginationParams(query);

    const { users, total } = await this.userService.list({
      page,
      limit,
      search: query.search,
      roleId: query.role_id,
      active: query.active !== undefined ? query.active === "true" : undefined,
      portalId,
    });

    const data = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      created_at: user.createdAt,
    }));

    return sendSuccess(reply, data, calculatePaginationMeta(total, page, limit));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createUserSchema.parse(request.body);
    const authUser = requireAuth(request);

    const createdUser = await this.userService.create(data, authUser.portal_id);

    return sendSuccess(reply, {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role.name,
    }, undefined, 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateUserSchema.parse(request.body);

    const user = await this.userService.update(id, data);

    return sendSuccess(reply, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      active: user.active,
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const currentUser = requireAuth(request);

    if (id === currentUser.id) {
      throw badRequest("Você não pode desativar sua própria conta");
    }

    await this.userService.deactivate(id);

    return sendSuccess(reply, {
      message: "Usuário desativado com sucesso",
    });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const data = updateProfileSchema.parse(request.body);
    const userId = requireAuth(request).id;

    const user = await this.userService.updateProfile(userId, data);

    return sendSuccess(reply, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const data = changePasswordSchema.parse(request.body);
    const userId = requireAuth(request).id;

    await this.userService.changePassword(userId, data.current_password, data.new_password);

    return sendSuccess(reply, {
      message: "Senha alterada com sucesso",
    });
  }
}

export const userController = new UserController();
