import { PrismaClient } from "@prisma/client";
import { CustomError, Logger } from "../../domain";

export class MaintenanceSchedulerJob {
  constructor(private prisma: PrismaClient) {}

  /**
   * Job principal que debe ejecutarse diariamente
   * Revisa todos los vehículos y programa mantenimientos automáticamente
   */
  async executeDaily(): Promise<void> {
    Logger.info("🔄 Iniciando programación automática de mantenimientos...");

    try {
      // 1. Obtener vehículos activos con schedule
      const vehicles = await this.getVehiclesForScheduling();

      let scheduledCount = 0;

      for (const vehicle of vehicles) {
        const wasScheduled = await this.checkAndScheduleMaintenance(vehicle);
        if (wasScheduled) scheduledCount++;
      }

      Logger.info(`✅ Mantenimientos programados: ${scheduledCount}`);

      // 2. Generar alertas automáticamente
      await this.generateAutomaticAlerts();

      // 3. Actualizar estados de mantenimientos vencidos
      await this.updateOverdueMaintenances();
    } catch (error) {
      Logger.error("❌ Ocurrió un error en la programación automática:", error);
      throw error;
    }
  }

  /**
   * Obtiene vehículos que necesitan revisión de programación
   */
  private async getVehiclesForScheduling() {
    return await this.prisma.vehicle.findMany({
      include: {
        maintenanceSchedule: true,
        maintenances: {
          where: { status: "COMPLETADO" },
          orderBy: { performedDate: "desc" },
          take: 1,
        },
        FuelConsumption: {
          orderBy: { consumedAt: "desc" },
          take: 1,
        },
      },
      where: {
        maintenanceSchedule: {
          isActive: true,
        },
      },
    });
  }

  /**
   * Verifica si un vehículo necesita mantenimiento y lo programa
   */
  private async checkAndScheduleMaintenance(vehicle: any): Promise<boolean> {
    const schedule = vehicle.maintenanceSchedule;
    if (!schedule) return false;

    const lastMaintenance = vehicle.maintenances[0];
    const lastMaintenanceDate =
      lastMaintenance?.performedDate || vehicle.createdAt;

    // Calcular próxima fecha basada en meses
    const nextDateByTime = new Date(lastMaintenanceDate);
    nextDateByTime.setMonth(
      nextDateByTime.getMonth() + schedule.intervalMonths
    );

    const today = new Date();
    const daysDifference = Math.ceil(
      (nextDateByTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    Logger.info(
      `- Vehículo ${vehicle.licensePlate}: Próximo mantenimiento en ${daysDifference} días`
    );

    // Programar si falta 1 semana o menos (7 días)
    const shouldScheduleByDate = daysDifference <= 7;

    // TODO: Lógica por kilometraje (requiere consumo de combustible)
    let shouldScheduleByMileage = false;
    if (schedule.intervalKilometers && vehicle.FuelConsumption[0]) {
      const currentMileage = vehicle.FuelConsumption[0].currentMileage;
      const lastMaintenanceMileage = lastMaintenance?.currentMileage || 0;
      const mileageDifference = currentMileage - lastMaintenanceMileage;

      shouldScheduleByMileage =
        mileageDifference >= schedule.intervalKilometers;
    }

    if (shouldScheduleByDate || shouldScheduleByMileage) {
      // Verificar que no haya ya un mantenimiento programado próximo
      const existingScheduled = await this.prisma.vehicleMaintenance.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: { in: ["PROGRAMADO", "EN_PROGRESO"] },
          scheduledDate: {
            gte: today,
            lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // próximos 30 días
          },
        },
      });

      if (!existingScheduled) {
        await this.createScheduledMaintenance(vehicle, nextDateByTime);
        Logger.info(
          `📅 Mantenimiento programado para vehículo ${vehicle.licensePlate}`
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Crea un mantenimiento programado automáticamente
   */
  private async createScheduledMaintenance(vehicle: any, scheduledDate: Date) {
    // Obtener todos los procedimientos activos
    const procedures = await this.prisma.maintenanceProcedure.findMany({
      where: { isActive: true },
    });

    // Obtener usuario del sistema (o administrador)
    const systemUser = await this.prisma.user.findFirst({
      where: { username: "admin" }, // Ajustar según tu sistema
    });

    if (!systemUser) {
      throw CustomError.notFound("Usuario del sistema no encontrado");
    }

    await this.prisma.vehicleMaintenance.create({
      data: {
        vehicleId: vehicle.id,
        scheduledDate,
        status: "PROGRAMADO",
        userId: systemUser.id,
        notes: "Mantenimiento programado automáticamente por el sistema",
        maintenanceItems: {
          create: procedures.map((proc) => ({
            procedureId: proc.id,
            isCompleted: false,
          })),
        },
      },
    });
  }

  /**
   * Genera alertas automáticas para mantenimientos próximos
   */
  async generateAutomaticAlerts(): Promise<void> {
    Logger.info("🚨 Generando alertas automáticas...");

    const today = new Date();
    const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);

    // Obtener mantenimientos próximos sin alertas
    const upcomingMaintenances = await this.prisma.vehicleMaintenance.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lte: in15Days,
        },
        status: { in: ["PROGRAMADO", "EN_PROGRESO"] },
      },
      include: { vehicle: true },
    });

    const alerts = [];

    for (const maintenance of upcomingMaintenances) {
      const daysDifference = Math.ceil(
        (maintenance.scheduledDate!.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Verificar si ya existe una alerta para este mantenimiento
      const existingAlert = await this.prisma.maintenanceAlert.findFirst({
        where: {
          vehicleId: maintenance.vehicleId,
          scheduledFor: maintenance.scheduledDate,
          isRead: false,
        },
      });

      if (!existingAlert) {
        let priority: "BAJO" | "MEDIO" | "ALTO" | "CRITICO" = "BAJO";
        let alertType: "POR_FECHA" | "POR_KILOMETRAJE" | "VENCIDO" | "URGENTE" =
          "POR_FECHA";
        let message = "";

        if (daysDifference <= 0) {
          priority = "CRITICO";
          alertType = "VENCIDO";
          message = `Mantenimiento VENCIDO para ${maintenance.vehicle.licensePlate}`;
        } else if (daysDifference <= 3) {
          priority = "ALTO";
          alertType = "URGENTE";
          message = `Mantenimiento URGENTE en ${daysDifference} días para ${maintenance.vehicle.licensePlate}`;
        } else if (daysDifference <= 7) {
          priority = "MEDIO";
          message = `Mantenimiento próximo en ${daysDifference} días para ${maintenance.vehicle.licensePlate}`;
        } else if (daysDifference <= 15) {
          priority = "BAJO";
          message = `Mantenimiento programado en ${daysDifference} días para ${maintenance.vehicle.licensePlate}`;
        }

        if (message) {
          alerts.push({
            vehicleId: maintenance.vehicleId,
            alertType,
            message,
            priority,
            scheduledFor: maintenance.scheduledDate,
            daysDue: daysDifference <= 0 ? Math.abs(daysDifference) : null,
          });
        }
      }
    }

    if (alerts.length > 0) {
      await this.prisma.maintenanceAlert.createMany({
        data: alerts,
        skipDuplicates: true,
      });
      Logger.info(`🚨 ${alerts.length} nuevas alertas generadas`);
    }
  }

  /**
   * Actualiza mantenimientos vencidos a estado VENCIDO
   */
  private async updateOverdueMaintenances(): Promise<void> {
    const today = new Date();

    const overdueCount = await this.prisma.vehicleMaintenance.updateMany({
      where: {
        scheduledDate: { lt: today },
        status: { in: ["PROGRAMADO", "EN_PROGRESO"] },
      },
      data: {
        status: "VENCIDO",
        updatedAt: today,
      },
    });

    if (overdueCount.count > 0) {
      Logger.info(
        `⚠️ ${overdueCount.count} mantenimientos marcados como VENCIDOS`
      );
    }
  }

  /**
   * Limpia alertas antiguas (opcional, para mantenimiento de BD)
   */
  async cleanOldAlerts(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await this.prisma.maintenanceAlert.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    Logger.info(`🧹 ${deletedCount.count} alertas antiguas eliminadas`);
  }
}
