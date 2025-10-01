import { envs } from "./config";
import { prisma } from "./data/postgresql";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { CronService } from "./infrastructure/services/cron.service";
import { DIContainer } from "./infrastructure/di/container";
import { ILogger } from "./domain";

(() => {
  main();
})();

async function main() {
  // Obtener logger del DI Container
  const container = DIContainer.getInstance();
  const logger = container.resolve<ILogger>("Logger");

  try {
    await prisma.$connect();
    logger.info("Connected to database successfully");

    // Inicializar trabajos programados
    const cronService = new CronService(prisma);
    cronService.startCronJobs();
    logger.info("Cron jobs initialized");

    const server = new Server({ port: envs.PORT, routes: AppRoutes.routes });

    server.start();
  } catch (error) {
    logger.error("Failed to start application", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}
