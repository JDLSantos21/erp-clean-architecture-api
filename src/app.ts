import { envs } from "./config";
import { prisma } from "./data/postgresql";
import { AppRoutes } from "./presentation/routes";
import { Server } from "./presentation/server";
import { CronService } from "./infrastructure/services/cron.service";

(() => {
  main();
})();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    // Inicializar trabajos programados
    const cronService = new CronService(prisma);
    cronService.startCronJobs();

    const server = new Server({ port: envs.PORT, routes: AppRoutes.routes });
    server.start();
  } catch (error) {
    console.error("Connection to database failed:", error);
    process.exit(1);
  }
}
