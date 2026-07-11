import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development"
    ? [{ level: "query", emit: "event" }, "error", "warn"]
    : ["error"],
});

// Em desenvolvimento, loga queries de forma mais segura (sem valores dos parâmetros)
if (env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: unknown) => {
    const event = e as { query: string; duration: number };
    // Loga apenas a query e duração, sem os parâmetros
    process.stdout.write(`\x1b[90m[Prisma] ${event.duration}ms — ${event.query.slice(0, 200)}\x1b[0m\n`);
  });
}
