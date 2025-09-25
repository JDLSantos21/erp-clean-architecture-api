import * as cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { MaintenanceSchedulerJob } from "../jobs/maintenance-scheduler.job";

export class CronService {
  private maintenanceJob: MaintenanceSchedulerJob;

  constructor(private prisma: PrismaClient) {
    this.maintenanceJob = new MaintenanceSchedulerJob(prisma);
  }

  /**
   * Inicia todos los trabajos programados
   */
  startCronJobs(): void {
    console.log("🚀 Iniciando trabajos programados...");

    // Ejecutar diariamente a las 6:00 AM
    cron.schedule("0 6 * * *", async () => {
      console.log("⏰ Ejecutando programación automática de mantenimientos...");
      try {
        await this.maintenanceJob.executeDaily();
      } catch (error) {
        console.error("❌ Error en job de mantenimientos:", error);
      }
    });

    // Ejecutar cada 4 horas para generar alertas
    cron.schedule("0 */4 * * *", async () => {
      console.log("⏰ Generando alertas de mantenimiento...");
      try {
        await this.maintenanceJob.generateAutomaticAlerts();
      } catch (error) {
        console.error("❌ Error generando alertas:", error);
      }
    });

    // Limpiar alertas antiguas cada domingo a medianoche
    cron.schedule("0 0 * * 0", async () => {
      console.log("⏰ Limpiando alertas antiguas...");
      try {
        await this.maintenanceJob.cleanOldAlerts();
      } catch (error) {
        console.error("❌ Error limpiando alertas:", error);
      }
    });

    console.log("✅ Trabajos programados iniciados correctamente");
  }

  /**
   * Ejecutar manualmente el job de mantenimientos (para testing)
   */
  async runMaintenanceJobManually(): Promise<void> {
    console.log("🔧 Ejecutando job de mantenimientos manualmente...");
    await this.maintenanceJob.executeDaily();
  }

  /**
   * Generar alertas manualmente (para testing)
   */
  async runAlertsManually(): Promise<void> {
    console.log("🚨 Generando alertas manualmente...");
    // Aquí podemos llamar directamente al método generateAutomaticAlerts del datasource
    // o crear un método específico en el job
  }
}
