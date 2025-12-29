import * as cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { MaintenanceSchedulerJob } from "../jobs/maintenance-scheduler.job";
import { TelemetrySyncJob } from "../jobs/telemetry-sync.job";
import { Logger } from "../../domain";

export class CronService {
  private maintenanceJob: MaintenanceSchedulerJob;

  constructor(private prisma: PrismaClient) {
    this.maintenanceJob = new MaintenanceSchedulerJob(prisma);
  }

  /**
   * Inicia todos los trabajos programados
   */
  startCronJobs(): void {
    Logger.info("🚀 Iniciando trabajos programados...");

    // Iniciar sincronización de telemetría
    TelemetrySyncJob.start();

    // Ejecutar diariamente a las 6:00 AM
    cron.schedule("0 6 * * *", async () => {
      Logger.info("⏰ Ejecutando programación automática de mantenimientos...");
      try {
        await this.maintenanceJob.executeDaily();
      } catch (error) {
        Logger.error("❌ Error en job de mantenimientos:", error);
      }
    });

    // Ejecutar cada 4 horas para generar alertas
    cron.schedule("0 */4 * * *", async () => {
      Logger.info("⏰ Generando alertas de mantenimiento...");
      try {
        await this.maintenanceJob.generateAutomaticAlerts();
      } catch (error) {
        Logger.error("❌ Error generando alertas:", error);
      }
    });

    // Limpiar alertas antiguas cada domingo a medianoche
    cron.schedule("0 0 * * 0", async () => {
      Logger.info("⏰ Limpiando alertas antiguas...");
      try {
        await this.maintenanceJob.cleanOldAlerts();
      } catch (error) {
        Logger.error("❌ Error limpiando alertas:", error);
      }
    });

    Logger.info("✅ Trabajos programados iniciados correctamente");
  }

  /**
   * Ejecutar manualmente el job de mantenimientos (para testing)
   */
  async runMaintenanceJobManually(): Promise<void> {
    Logger.info("🔧 Ejecutando job de mantenimientos manualmente...");
    await this.maintenanceJob.executeDaily();
  }

  /**
   * Generar alertas manualmente (para testing)
   */
  async runAlertsManually(): Promise<void> {
    Logger.info("🚨 Generando alertas manualmente...");
    // Aquí podemos llamar directamente al método generateAutomaticAlerts del datasource
    // o crear un método específico en el job
  }
}
