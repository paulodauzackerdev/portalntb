import crypto from "crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import csrf from "@fastify/csrf-protection";

import { env, corsConfig, jwtConfig } from "./config";
import { errorMiddleware } from "./middlewares";
import type { JwtDecoded, JwtPayload } from "./types/jwt";
import { authRoutes } from "./routes/auth.routes";
import { newsRoutes } from "./routes/news.routes";
import { categoryRoutes } from "./routes/category.routes";
import { tagRoutes } from "./routes/tag.routes";
import { userRoutes } from "./routes/user.routes";
import { uploadRoutes } from "./routes/upload.routes";
import { portalRoutes } from "./routes/portal.routes";
import { bannerRoutes } from "./routes/banner.routes";
import { statsRoutes } from "./routes/stats.routes";

export async function buildApp() {
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: env.LOG_LEVEL,
      transport: env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
  });

  // Plugins
  await app.register(cors, corsConfig);

  // CSRF protection (após cors, antes do helmet)
  // API REST com JWT no header Authorization não é vulnerável a CSRF clássico
  // (o navegador não envia header Authorization automaticamente entre origens).
  // Registramos apenas para expor reply.generateCsrf() se necessário no futuro.
  await app.register(csrf, {
    cookieOpts: { signed: true },
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'", "https://www.youtube.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
  });

  // JWT com formatUser para transformar o payload automaticamente
  await app.register(jwt, {
    secret: jwtConfig.secret,
    formatUser: (payload: JwtPayload): JwtDecoded => {
      if (!payload.sub || !payload.email || !payload.role || !payload.portal_id) {
        throw new Error("Invalid JWT payload: missing required fields");
      }
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        portal_id: payload.portal_id,
      };
    },
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET || crypto.randomBytes(32).toString("hex"),
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  });

  // Swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "CMS de Notícias API",
        description: "API REST para o CMS de Notícias",
        version: "1.0.0",
      },
      servers: [
        { url: `http://localhost:${env.PORT}/api/v1`, description: "Desenvolvimento" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  // Error handler
  app.setErrorHandler(errorMiddleware);

  // Health check
  app.get("/api/v1/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Rotas
  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await app.register(newsRoutes, { prefix: "/api/v1/news" });
  await app.register(categoryRoutes, { prefix: "/api/v1/categories" });
  await app.register(tagRoutes, { prefix: "/api/v1/tags" });
  await app.register(userRoutes, { prefix: "/api/v1/users" });
  await app.register(uploadRoutes, { prefix: "/api/v1/upload" });
  await app.register(portalRoutes, { prefix: "/api/v1/portal" });
  await app.register(bannerRoutes, { prefix: "/api/v1/banner" });
  await app.register(statsRoutes, { prefix: "/api/v1/stats" });

  return app;
}
