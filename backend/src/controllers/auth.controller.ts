import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/auth.service";
import { loginSchema } from "../schemas/auth.schema";
import { sendSuccess } from "../utils";
import { env } from "../config/env";
import type { JwtDecoded } from "../types/jwt";

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = loginSchema.parse(request.body);

    const result = await this.authService.login(email, password);

    // Set refresh token cookie
    reply.setCookie("refresh_token", result.refresh_token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
      path: "/api/v1/auth",
    });

    return sendSuccess(reply, {
      access_token: result.access_token,
      user: result.user,
    });
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.cookies.refresh_token;
    if (!refreshToken) {
      return reply.status(401).send({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Refresh token não fornecido" },
      });
    }

    try {
      const result = await this.authService.refresh(refreshToken);

      reply.setCookie("refresh_token", result.refresh_token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
        path: "/api/v1/auth",
      });

      return sendSuccess(reply, {
        access_token: result.access_token,
      });
    } catch (err) {
      reply.clearCookie("refresh_token", { path: "/api/v1/auth" });
      throw err;
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // Tentar obter userId mesmo se o JWT já estiver expirado
    let userId: string | undefined;
    try {
      await request.jwtVerify();
      userId = request.user?.id;
    } catch {
      // Token expirado ou inválido — tentar extrair do payload decodificado
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const decoded = request.jwt.decode(token) as JwtDecoded | null;
          userId = decoded?.id;
        } catch {
          // Não foi possível decodificar
        }
      }
    }
    const refreshToken = request.cookies.refresh_token;

    if (userId) {
      await this.authService.logout(userId, refreshToken);
    }

    reply.clearCookie("refresh_token", { path: "/api/v1/auth" });

    return sendSuccess(reply, {
      message: "Logout realizado com sucesso",
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return sendSuccess(reply, request.user);
  }
}
