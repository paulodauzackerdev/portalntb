import { buildApp } from "./app";
import { env, prisma } from "./config";

async function main() {
  const app = await buildApp();

  try {
    // Conecta ao banco
    await prisma.$connect();
    console.log("✅ Conectado ao PostgreSQL");

    // Inicia o servidor
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`✅ Servidor rodando em http://localhost:${env.PORT}`);
    console.log(`📚 Documentação: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🔄 Encerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

main();
