import { PrismaClient } from "@prisma/client";
import { Logger } from "../../domain";

/**
 * Script para configurar schedules de mantenimiento para vehículos existentes
 * Ejecutar una vez para inicializar el sistema
 */
export class MaintenanceSetupService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Configurar schedules de mantenimiento para todos los vehículos
   */
  async setupMaintenanceSchedulesForAllVehicles(): Promise<void> {
    // Obtener vehículos sin schedule
    const vehiclesWithoutSchedule = await this.prisma.vehicle.findMany({
      where: {
        maintenanceSchedule: null,
      },
    });

    Logger.info(
      `📋 Encontrados ${vehiclesWithoutSchedule.length} vehículos sin schedule`
    );

    const defaultSchedules = [];

    for (const vehicle of vehiclesWithoutSchedule) {
      // Configuración por defecto: cada 2 meses o 5000 km
      defaultSchedules.push({
        vehicleId: vehicle.id,
        intervalMonths: 2,
        intervalKilometers: 5000,
        isActive: true,
      });
    }

    if (defaultSchedules.length > 0) {
      await this.prisma.maintenanceSchedule.createMany({
        data: defaultSchedules,
        skipDuplicates: true,
      });

      Logger.info(
        `✅ ${defaultSchedules.length} schedules creados exitosamente`
      );
    }
  }

  /**
   * Configurar schedule personalizado para un vehículo específico
   */
  async setupCustomScheduleForVehicle(
    vehicleId: string,
    intervalMonths: number,
    intervalKilometers?: number
  ): Promise<void> {
    await this.prisma.maintenanceSchedule.upsert({
      where: { vehicleId },
      update: {
        intervalMonths,
        intervalKilometers,
        isActive: true,
      },
      create: {
        vehicleId,
        intervalMonths,
        intervalKilometers,
        isActive: true,
      },
    });
  }

  /**
   * Ver estadísticas de schedules
   */
  async getScheduleStats(): Promise<any> {
    const stats = await this.prisma.maintenanceSchedule.groupBy({
      by: ["intervalMonths", "intervalKilometers"],
      _count: {
        id: true,
      },
    });

    const total = await this.prisma.vehicle.count();
    const withSchedule = await this.prisma.maintenanceSchedule.count();
    const withoutSchedule = total - withSchedule;

    return {
      total,
      withSchedule,
      withoutSchedule,
      configurations: stats,
    };
  }
}
