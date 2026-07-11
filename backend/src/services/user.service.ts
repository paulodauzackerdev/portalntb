import { hashPassword, comparePassword } from "../utils/hash";
import { conflict, notFound, badRequest } from "../utils/error";
import type { IUserRepository } from "../types/repositories";
import { userRepository as defaultUserRepo } from "../repositories";

export class UserService {
  constructor(
    private userRepository: IUserRepository = defaultUserRepo,
  ) {}
  async create(data: {
    email: string;
    password: string;
    name: string;
    role_id: string;
  }, portalId: string) {
    // Verificar se email já existe
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw conflict("Email já cadastrado");
    }

    const hashedPassword = await hashPassword(data.password);

    return this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: { connect: { id: data.role_id } },
      portal: { connect: { id: portalId } },
    });
  }

  async update(id: string, data: {
    name?: string;
    role_id?: string;
    active?: boolean;
    avatar?: string | null;
  }) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw notFound("Usuário não encontrado");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role_id) updateData.role = { connect: { id: data.role_id } };

    return this.userRepository.update(id, updateData);
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string | null }) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw notFound("Usuário não encontrado");
    }

    return this.userRepository.update(id, data);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw notFound("Usuário não encontrado");
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw badRequest("Senha atual incorreta");
    }

    const hashedPassword = await hashPassword(newPassword);
    return this.userRepository.update(id, { password: hashedPassword });
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    roleId?: string;
    active?: boolean;
    portalId: string;
  }) {
    const { users, total } = await this.userRepository.findMany(params);
    return { users, total };
  }

  async deactivate(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw notFound("Usuário não encontrado");
    }

    // Soft delete: desativar
    return this.userRepository.update(id, { active: false });
  }
}

export const userService = new UserService();
