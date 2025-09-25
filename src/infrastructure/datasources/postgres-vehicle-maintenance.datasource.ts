import { PrismaClient } from "@prisma/client";
import {
  VehicleMaintenanceDatasource,
  CreateMaintenanceProcedureDto,
  MaintenanceReportDto,
  CreateMaintenanceDto,
  MaintenanceQueryDto,
  MaintenanceProcedure,
  VehicleMaintenance,
  MaintenanceAlert,
  MaintenanceSchedule,
  Vehicle,
} from "../../domain";

export class PostgresVehicleMaintenanceDatasource extends VehicleMaintenanceDatasource {
  constructor(private prisma: PrismaClient) {
    super();
  }

  // Mappers para convertir de Prisma a entidades de dominio
  private mapMaintenanceProcedure(data: any): MaintenanceProcedure {
    return new MaintenanceProcedure({
      ...data,
      description: data.description ?? undefined,
    });
  }

  private mapVehicleMaintenance(data: any): VehicleMaintenance {
    return new VehicleMaintenance({
      ...data,
      scheduledDate: data.scheduledDate ?? undefined,
      performedDate: data.performedDate ?? undefined,
      totalCost: data.totalCost ?? undefined,
      notes: data.notes ?? undefined,
    });
  }

  private mapMaintenanceAlert(data: any): MaintenanceAlert {
    return new MaintenanceAlert({
      ...data,
      daysDue: data.daysDue ?? undefined,
      scheduledFor: data.scheduledFor ?? undefined,
    });
  }

  private mapMaintenanceSchedule(data: any): MaintenanceSchedule {
    return new MaintenanceSchedule({
      ...data,
      intervalKilometers: data.intervalKilometers ?? undefined,
    });
  }

  // Procedimientos de Mantenimiento
  async createMaintenanceProcedure(
    data: CreateMaintenanceProcedureDto
  ): Promise<MaintenanceProcedure> {
    const procedure = await this.prisma.maintenanceProcedure.create({
      data: {
        name: data.name,
        category: data.category as any,
        description: data.description,
      },
    });

    return this.mapMaintenanceProcedure(procedure);
  }

  async getMaintenanceProcedures(): Promise<MaintenanceProcedure[]> {
    const procedures = await this.prisma.maintenanceProcedure.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return procedures.map((p) => this.mapMaintenanceProcedure(p));
  }

  async updateMaintenanceProcedure(
    id: number,
    data: Partial<CreateMaintenanceProcedureDto>
  ): Promise<MaintenanceProcedure> {
    const procedure = await this.prisma.maintenanceProcedure.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category as any,
        description: data.description,
      },
    });

    return this.mapMaintenanceProcedure(procedure);
  }

  async deleteMaintenanceProcedure(id: number): Promise<void> {
    await this.prisma.maintenanceProcedure.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Gestión de Mantenimientos
  async createMaintenance(
    data: CreateMaintenanceDto
  ): Promise<VehicleMaintenance> {
    // Obtener todos los procedimientos activos para crear los items
    const procedures = await this.prisma.maintenanceProcedure.findMany({
      where: { isActive: true },
    });

    const maintenance = await this.prisma.vehicleMaintenance.create({
      data: {
        vehicleId: data.vehicleId,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
        status: "PROGRAMADO",
        userId: "system", // TODO: obtener del contexto
        maintenanceItems: {
          create: procedures.map((proc) => ({
            procedureId: proc.id,
            isCompleted: false,
          })),
        },
      },
      include: {
        maintenanceItems: true,
        vehicle: true,
      },
    });

    return this.mapVehicleMaintenance(maintenance);
  }

  async getMaintenances(filters: MaintenanceQueryDto): Promise<{
    maintenances: VehicleMaintenance[];
    total: number;
  }> {
    const where: any = {};

    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.scheduledDate = {};
      if (filters.dateFrom) where.scheduledDate.gte = filters.dateFrom;
      if (filters.dateTo) where.scheduledDate.lte = filters.dateTo;
    }

    const [maintenances, total] = await Promise.all([
      this.prisma.vehicleMaintenance.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { [filters.sortBy!]: filters.sortOrder },
        include: {
          vehicle: true,
          maintenanceItems: {
            include: { procedure: true },
          },
        },
      }),
      this.prisma.vehicleMaintenance.count({ where }),
    ]);

    return {
      maintenances: maintenances.map((m) => this.mapVehicleMaintenance(m)),
      total,
    };
  }

  async getMaintenanceById(id: string): Promise<VehicleMaintenance | null> {
    const maintenance = await this.prisma.vehicleMaintenance.findUnique({
      where: { id },
      include: {
        vehicle: true,
        maintenanceItems: {
          include: { procedure: true },
        },
      },
    });

    return maintenance ? this.mapVehicleMaintenance(maintenance) : null;
  }

  async updateMaintenanceStatus(
    id: string,
    status:
      | "PROGRAMADO"
      | "EN_PROGRESO"
      | "COMPLETADO"
      | "CANCELADO"
      | "VENCIDO"
      | "PARCIAL"
  ): Promise<VehicleMaintenance> {
    const maintenance = await this.prisma.vehicleMaintenance.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
        maintenanceItems: true,
      },
    });

    return this.mapVehicleMaintenance(maintenance);
  }

  async deleteMaintenance(id: string): Promise<void> {
    await this.prisma.vehicleMaintenance.delete({
      where: { id },
    });
  }

  // Sistema de Alertas Automáticas
  async generateMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    // Obtener vehículos que necesitan mantenimiento
    const vehiclesNeedingMaintenance = await this.prisma.vehicle.findMany({
      include: {
        maintenanceSchedule: true,
        maintenances: {
          orderBy: { performedDate: "desc" },
          take: 1,
        },
        FuelConsumption: {
          orderBy: { consumedAt: "desc" },
          take: 1,
        },
      },
    });

    const alerts: any[] = [];
    const today = new Date();

    for (const vehicle of vehiclesNeedingMaintenance) {
      if (!vehicle.maintenanceSchedule) continue;

      const lastMaintenance = vehicle.maintenances[0];
      const lastMaintenanceDate =
        lastMaintenance?.performedDate || vehicle.createdAt;

      // Calcular próxima fecha de mantenimiento
      const nextDate = new Date(lastMaintenanceDate);
      nextDate.setMonth(
        nextDate.getMonth() + vehicle.maintenanceSchedule.intervalMonths
      );

      const daysDifference = Math.ceil(
        (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: "BAJO" | "MEDIO" | "ALTO" | "CRITICO" = "BAJO";
      let alertType: "POR_FECHA" | "POR_KILOMETRAJE" | "VENCIDO" | "URGENTE" =
        "POR_FECHA";
      let message = "";

      if (daysDifference <= 0) {
        priority = "CRITICO";
        alertType = "VENCIDO";
        message = `Mantenimiento vencido hace ${Math.abs(daysDifference)} días`;
      } else if (daysDifference <= 7) {
        priority = "ALTO";
        alertType = "URGENTE";
        message = `Mantenimiento debido en ${daysDifference} días`;
      } else if (daysDifference <= 15) {
        priority = "MEDIO";
        message = `Mantenimiento próximo en ${daysDifference} días`;
      }

      if (message) {
        alerts.push({
          vehicleId: vehicle.id,
          alertType,
          message,
          priority,
          scheduledFor: nextDate,
          daysDue: daysDifference <= 0 ? Math.abs(daysDifference) : null,
        });
      }
    }

    // Crear alertas en la base de datos
    if (alerts.length > 0) {
      await this.prisma.maintenanceAlert.createMany({
        data: alerts,
        skipDuplicates: true,
      });
    }

    const createdAlerts = await this.prisma.maintenanceAlert.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: { vehicle: true },
    });

    return createdAlerts.map((alert) => this.mapMaintenanceAlert(alert));
  }

  async getMaintenanceAlerts(
    vehicleId?: string,
    priority?: "BAJO" | "MEDIO" | "ALTO" | "CRITICO"
  ): Promise<MaintenanceAlert[]> {
    const where: any = { isRead: false };
    if (vehicleId) where.vehicleId = vehicleId;
    if (priority) where.priority = priority;

    const alerts = await this.prisma.maintenanceAlert.findMany({
      where,
      include: { vehicle: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return alerts.map((alert) => this.mapMaintenanceAlert(alert));
  }

  async markAlertAsRead(alertId: string): Promise<MaintenanceAlert> {
    const alert = await this.prisma.maintenanceAlert.update({
      where: { id: alertId },
      data: { isRead: true },
      include: { vehicle: true },
    });

    return this.mapMaintenanceAlert(alert);
  }

  async dismissAlert(alertId: string): Promise<void> {
    await this.prisma.maintenanceAlert.delete({
      where: { id: alertId },
    });
  }

  // Reportes y Análisis
  async getMaintenanceReport(filters: MaintenanceReportDto): Promise<any> {
    const where: any = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.performedDate = {};
      if (filters.dateFrom) where.performedDate.gte = filters.dateFrom;
      if (filters.dateTo) where.performedDate.lte = filters.dateTo;
    }

    return await this.prisma.vehicleMaintenance.findMany({
      where,
      include: {
        vehicle: true,
        maintenanceItems: {
          include: { procedure: true },
        },
      },
    });
  }

  async getMaintenanceCostAnalysis(dateFrom: Date, dateTo: Date): Promise<any> {
    return await this.prisma.vehicleMaintenance.groupBy({
      by: ["vehicleId"],
      where: {
        performedDate: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _sum: { totalCost: true },
      _count: { id: true },
    });
  }

  async getVehicleMaintenanceEfficiency(vehicleId?: string): Promise<any> {
    const where: any = { status: "COMPLETADO" };
    if (vehicleId) where.vehicleId = vehicleId;

    return await this.prisma.vehicleMaintenance.findMany({
      where,
      include: {
        vehicle: true,
        maintenanceItems: true,
      },
    });
  }

  async getIncompleteMaintenanceReport(): Promise<VehicleMaintenance[]> {
    const maintenances = await this.prisma.vehicleMaintenance.findMany({
      where: {
        OR: [
          { status: "PROGRAMADO" },
          { status: "EN_PROGRESO" },
          { status: "PARCIAL" },
        ],
      },
      include: {
        vehicle: true,
        maintenanceItems: {
          include: { procedure: true },
        },
      },
    });

    return maintenances.map((m) => this.mapVehicleMaintenance(m));
  }

  async getOverdueMaintenances(): Promise<VehicleMaintenance[]> {
    const today = new Date();
    const maintenances = await this.prisma.vehicleMaintenance.findMany({
      where: {
        scheduledDate: { lt: today },
        status: { not: "COMPLETADO" },
      },
      include: {
        vehicle: true,
        maintenanceItems: true,
      },
    });

    return maintenances.map((m) => this.mapVehicleMaintenance(m));
  }

  async getUpcomingMaintenances(days: number): Promise<VehicleMaintenance[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const maintenances = await this.prisma.vehicleMaintenance.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lte: futureDate,
        },
        status: { in: ["PROGRAMADO", "EN_PROGRESO"] },
      },
      include: {
        vehicle: true,
        maintenanceItems: true,
      },
    });

    return maintenances.map((m) => this.mapVehicleMaintenance(m));
  }

  // Automatización
  async checkAndCreateScheduledMaintenances(): Promise<VehicleMaintenance[]> {
    // Esta lógica se implementará en el próximo paso
    return [];
  }

  async calculateNextMaintenanceDate(
    vehicleId: string
  ): Promise<{ nextDate: Date; nextMileage?: number }> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        maintenanceSchedule: true,
        maintenances: {
          where: { status: "COMPLETADO" },
          orderBy: { performedDate: "desc" },
          take: 1,
        },
      },
    });

    if (!vehicle?.maintenanceSchedule) {
      throw new Error("Vehicle does not have a maintenance schedule");
    }

    const lastMaintenance = vehicle.maintenances[0];
    const baseDate = lastMaintenance?.performedDate || vehicle.createdAt;

    const nextDate = new Date(baseDate);
    nextDate.setMonth(
      nextDate.getMonth() + vehicle.maintenanceSchedule.intervalMonths
    );

    return { nextDate };
  }

  async getVehicleLastMaintenanceDate(vehicleId: string): Promise<Date | null> {
    const maintenance = await this.prisma.vehicleMaintenance.findFirst({
      where: {
        vehicleId,
        status: "COMPLETADO",
      },
      orderBy: { performedDate: "desc" },
    });

    return maintenance?.performedDate || null;
  }

  async getVehicleMaintenanceSchedule(
    vehicleId: string
  ): Promise<MaintenanceSchedule | null> {
    const schedule = await this.prisma.maintenanceSchedule.findUnique({
      where: { vehicleId },
    });

    return schedule ? this.mapMaintenanceSchedule(schedule) : null;
  }
}
