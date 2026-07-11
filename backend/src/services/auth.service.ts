import { FastifyInstance } from "fastify";
import crypto from "crypto";
import { comparePassword } from "../utils/hash";
import { unauthorized } from "../utils/error";
import { jwtConfig, prisma } from "../config";
import type { IUserRepository } from "../types/repositories";
import { userRepository as defaultUserRepo } from "../repositories";

export class AuthService {
  constructor(
    private app: FastifyInstance,
    private userRepository: IUserRepository = defaultUserRepo,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    // Mensagem genérica: não revela se email existe, se conta está desativada, etc.
    if (!user || !user.active) {
      throw unauthorized("Email ou senha inválidos");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw unauthorized("Email ou senha inválidos");
    }

    // Atualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Limpar tokens expirados antes de gerar novo
    await this.cleanupExpiredTokens();

    // Gerar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        role_id: user.roleId,
      },
    };
  }

  async refresh(refreshTokenValue: string) {
    const tokenHash = crypto.createHash("sha256").update(refreshTokenValue).digest("hex");

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: { include: { role: true } },
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw unauthorized("Refresh token inválido ou expirado");
    }

    // 🔐 DETECÇÃO DE REUSE: token já revogado = evidência de roubo
    // Revogar TODOS os tokens do usuário imediatamente
    if (storedToken.revoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revoked: false },
        data: { revoked: true },
      });
      throw unauthorized("Sessão comprometida. Faça login novamente.");
    }

    // Revogar o token atual (rotação normal)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Limpar tokens expirados
    await this.cleanupExpiredTokens();

    // Gerar novos tokens
    const accessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.user.id);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string, refreshTokenValue?: string) {
    if (refreshTokenValue) {
      const tokenHash = crypto.createHash("sha256").update(refreshTokenValue).digest("hex");
      await prisma.refreshToken.updateMany({
        where: { userId, token: tokenHash, revoked: false },
        data: { revoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    }
  }

  private generateAccessToken(user: { id: string; email: string; role: { name: string }; portalId: string }) {
    return this.app.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
        portal_id: user.portalId,
      },
      { expiresIn: jwtConfig.expiresIn }
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await prisma.refreshToken.create({
      data: {
        userId,
        token: tokenHash,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Remove tokens expirados ou revogados com mais de 30 dias.
   * Previne crescimento infinito da tabela refresh_tokens.
   */
  private async cleanupExpiredTokens() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true, createdAt: { lt: thirtyDaysAgo } },
        ],
      },
    });
  }
}
