import {
  VehicleDatasource,
  CustomError,
  RegisterVehicleDto,
  CreateMaintenanceScheduleDto,
  ProcessMaintenanceDto,
  UpdateMaintenanceItemDto,
  Vehicle,
  VehicleMaintenance,
  VehicleMaintenanceItem,
  MaintenanceSchedule,
} from "../../domain";

import { buildWhere } from "../mappers/prisma-where.mapper";
import { PrismaClient } from "@prisma/client";

export class VehicleDatasourceImpl extends VehicleDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async createVehicle(data: RegisterVehicleDto): Promise<Vehicle> {
    try {
      const registeredVehicle = await this.prisma.$transaction(
        async (prisma) => {
          const vehicle = await this.prisma.vehicle.create({ data });

          const { id, currentTag } = vehicle;

          await this.prisma.vehicleTagHistory.create({
            data: { tag: currentTag, vehicleId: id },
          });

          return vehicle;
        }
      );

      console.log("vehiculo registrado", registeredVehicle);

      const vehicle = new Vehicle(registeredVehicle);

      console.log("vehiculo registrado - entity", vehicle);

      return vehicle;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getVehicles(
    skip: number,
    limit: number,
    filters?: Partial<Vehicle>
  ): Promise<{ vehicles: Vehicle[]; total: number }> {
    const where = buildWhere(filters!, [
      "brand",
      "model",
      "chasis",
      "currentTag",
    ]);

    try {
      const [vehicles, total] = await Promise.all([
        this.prisma.vehicle.findMany({ skip, take: limit, where }),
        this.prisma.vehicle.count({ where }),
      ]);

      return { vehicles, total };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicleExist = await this.getVehicleById(id);

    if (!vehicleExist) throw CustomError.notFound("Vehicle not found");

    await this.prisma.vehicle.delete({
      where: {
        id,
      },
    });
  }

  async findByChasis(chasis: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: {
        chasis,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: {
        licensePlate,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async findByCurrentTag(currentTag: string): Promise<Vehicle | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: {
        currentTag,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    if (!id) return null;

    const vehicle = await this.prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async updateVehicle(id: string, data: RegisterVehicleDto): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data,
    });

    return new Vehicle(vehicle);
  }

  // Métodos de mantenimiento
  private mapVehicleMaintenance(data: any): VehicleMaintenance {
    return new VehicleMaintenance({
      ...data,
      scheduledDate: data.scheduledDate ?? undefined,
      performedDate: data.performedDate ?? undefined,
      totalCost: data.totalCost ?? undefined,
      notes: data.notes ?? undefined,
    });
  }

  private mapMaintenanceSchedule(data: any): MaintenanceSchedule {
    return new MaintenanceSchedule({
      ...data,
      intervalKilometers: data.intervalKilometers ?? undefined,
    });
  }

  private mapMaintenanceItem(data: any): VehicleMaintenanceItem {
    return new VehicleMaintenanceItem({
      ...data,
      cost: data.cost ?? undefined,
      notes: data.notes ?? undefined,
      completedAt: data.completedAt ?? undefined,
    });
  }

  async createMaintenanceSchedule(
    data: CreateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule> {
    try {
      const schedule = await this.prisma.maintenanceSchedule.create({
        data: {
          vehicleId: data.vehicleId,
          intervalMonths: data.intervalMonths,
          intervalKilometers: data.intervalKilometers,
        },
      });

      return this.mapMaintenanceSchedule(schedule);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getVehicleCurrentMileage(vehicleId: string): Promise<number | null> {
    try {
      const latestFuelConsumption = await this.prisma.fuelConsumption.findFirst(
        {
          where: { vehicleId },
          orderBy: { consumedAt: "desc" },
          select: { mileage: true },
        }
      );

      return latestFuelConsumption?.mileage ?? null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async processMaintenanceCompletion(
    data: ProcessMaintenanceDto,
    userId: string
  ): Promise<VehicleMaintenance> {
    try {
      // Buscar mantenimiento activo para el vehículo
      const activeMaintenance = await this.prisma.vehicleMaintenance.findFirst({
        where: {
          vehicleId: data.vehicleId,
          status: { in: ["PROGRAMADO", "EN_PROGRESO"] },
        },
        include: {
          maintenanceItems: true,
        },
      });

      if (!activeMaintenance) {
        throw CustomError.badRequest(
          "No se encontró un mantenimiento activo para este vehículo"
        );
      }

      // Actualizar el mantenimiento principal
      const totalCost = data.completedProcedures.reduce(
        (sum, proc) => sum + (proc.cost || 0),
        0
      );

      // Determinar el status basado en los procedimientos completados
      const allCompleted = data.completedProcedures.every(
        (proc) => proc.isCompleted
      );
      const someCompleted = data.completedProcedures.some(
        (proc) => proc.isCompleted
      );

      let status: "COMPLETADO" | "PARCIAL" | "EN_PROGRESO" = "EN_PROGRESO";
      if (allCompleted) {
        status = "COMPLETADO";
      } else if (someCompleted) {
        status = "PARCIAL";
      }

      const updatedMaintenance = await this.prisma.$transaction(
        async (prisma) => {
          // Actualizar items de mantenimiento
          for (const procedure of data.completedProcedures) {
            await this.prisma.vehicleMaintenanceItem.updateMany({
              where: {
                vehicleMaintenanceId: activeMaintenance.id,
                procedureId: procedure.procedureId,
              },
              data: {
                isCompleted: procedure.isCompleted,
                cost: procedure.cost,
                notes: procedure.notes,
                completedAt: procedure.isCompleted ? new Date() : null,
              },
            });
          }

          // Actualizar mantenimiento principal
          const maintenance = await this.prisma.vehicleMaintenance.update({
            where: { id: activeMaintenance.id },
            data: {
              status,
              performedDate: data.performedDate,
              totalCost,
              notes: data.notes,
              userId,
            },
            include: {
              vehicle: true,
              maintenanceItems: {
                include: { procedure: true },
              },
            },
          });

          return maintenance;
        }
      );

      return this.mapVehicleMaintenance(updatedMaintenance);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<VehicleMaintenance[]> {
    try {
      const maintenances = await this.prisma.vehicleMaintenance.findMany({
        where: { vehicleId },
        include: {
          vehicle: true,
          maintenanceItems: {
            include: { procedure: true },
          },
        },
        orderBy: { performedDate: "desc" },
      });

      return maintenances.map((m) => this.mapVehicleMaintenance(m));
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getCurrentMaintenanceStatus(
    vehicleId: string
  ): Promise<VehicleMaintenance | null> {
    try {
      const maintenance = await this.prisma.vehicleMaintenance.findFirst({
        where: {
          vehicleId,
          status: { in: ["PROGRAMADO", "EN_PROGRESO", "PARCIAL"] },
        },
        include: {
          vehicle: true,
          maintenanceItems: {
            include: { procedure: true },
          },
        },
        orderBy: { scheduledDate: "desc" },
      });

      return maintenance ? this.mapVehicleMaintenance(maintenance) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateMaintenanceItem(
    maintenanceId: string,
    procedureId: number,
    data: UpdateMaintenanceItemDto
  ): Promise<VehicleMaintenanceItem> {
    try {
      const item = await this.prisma.vehicleMaintenanceItem.updateMany({
        where: {
          vehicleMaintenanceId: maintenanceId,
          procedureId,
        },
        data: {
          isCompleted: data.isCompleted,
          cost: data.cost,
          notes: data.notes,
          completedAt: data.isCompleted ? new Date() : null,
        },
      });

      // Obtener el item actualizado
      const updatedItem = await this.prisma.vehicleMaintenanceItem.findFirst({
        where: {
          vehicleMaintenanceId: maintenanceId,
          procedureId,
        },
        include: { procedure: true },
      });

      if (!updatedItem) {
        throw CustomError.notFound("Item de mantenimiento no encontrado");
      }

      return this.mapMaintenanceItem(updatedItem);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getVehiclesNeedingMaintenance(): Promise<Vehicle[]> {
    try {
      const vehicles = await this.prisma.vehicle.findMany({
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
      });

      const vehiclesNeedingMaintenance: Vehicle[] = [];
      const today = new Date();

      for (const vehicle of vehicles) {
        if (!vehicle.maintenanceSchedule) continue;

        const lastMaintenance = vehicle.maintenances[0];
        const lastMaintenanceDate =
          lastMaintenance?.performedDate || vehicle.createdAt;

        // Verificar por fecha
        const nextDate = new Date(lastMaintenanceDate);
        nextDate.setMonth(
          nextDate.getMonth() + vehicle.maintenanceSchedule.intervalMonths
        );

        const needsMaintenanceByDate = nextDate <= today;

        // Verificar por kilometraje si está configurado
        let needsMaintenanceByMileage = false;
        if (
          vehicle.maintenanceSchedule.intervalKilometers &&
          vehicle.FuelConsumption[0]
        ) {
          const lastMaintenanceMileage = lastMaintenance?.currentMileage || 0;
          const currentMileage = vehicle.FuelConsumption[0].mileage;

          if (currentMileage !== null) {
            const mileageDifference = currentMileage - lastMaintenanceMileage;
            needsMaintenanceByMileage =
              mileageDifference >=
              vehicle.maintenanceSchedule.intervalKilometers;
          }
        }

        if (needsMaintenanceByDate || needsMaintenanceByMileage) {
          vehiclesNeedingMaintenance.push(new Vehicle(vehicle));
        }
      }

      return vehiclesNeedingMaintenance;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async generateScheduledMaintenance(
    vehicleId: string
  ): Promise<VehicleMaintenance> {
    try {
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

      if (!vehicle) {
        throw CustomError.notFound("Vehículo no encontrado");
      }

      if (!vehicle.maintenanceSchedule) {
        throw CustomError.badRequest(
          "El vehículo no tiene un programa de mantenimiento configurado"
        );
      }

      // Calcular fecha de próximo mantenimiento
      const lastMaintenance = vehicle.maintenances[0];
      const lastMaintenanceDate =
        lastMaintenance?.performedDate || vehicle.createdAt;

      const nextDate = new Date(lastMaintenanceDate);
      nextDate.setMonth(
        nextDate.getMonth() + vehicle.maintenanceSchedule.intervalMonths
      );

      // Obtener procedimientos activos
      const procedures = await this.prisma.maintenanceProcedure.findMany({
        where: { isActive: true },
      });

      const maintenance = await this.prisma.vehicleMaintenance.create({
        data: {
          vehicleId,
          scheduledDate: nextDate,
          status: "PROGRAMADO",
          userId: "system", // Sistema automático
          maintenanceItems: {
            create: procedures.map((proc) => ({
              procedureId: proc.id,
              isCompleted: false,
            })),
          },
        },
        include: {
          vehicle: true,
          maintenanceItems: {
            include: { procedure: true },
          },
        },
      });

      return this.mapVehicleMaintenance(maintenance);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async updateVehicleMileageFromFuel(vehicleId: string): Promise<Vehicle> {
    try {
      const latestFuelConsumption = await this.prisma.fuelConsumption.findFirst(
        {
          where: { vehicleId },
          orderBy: { consumedAt: "desc" },
        }
      );

      if (!latestFuelConsumption) {
        throw CustomError.notFound(
          "No se encontraron registros de combustible para este vehículo"
        );
      }

      // Aquí podrías actualizar algún campo del vehículo con el kilometraje actual
      // Por ahora solo retornamos el vehículo
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        throw CustomError.notFound("Vehículo no encontrado");
      }

      return new Vehicle(vehicle);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async checkMaintenanceByMileage(vehicleId: string): Promise<boolean> {
    try {
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

      if (!vehicle?.maintenanceSchedule?.intervalKilometers) {
        return false; // No hay configuración de kilometraje
      }

      const currentMileage = await this.getVehicleCurrentMileage(vehicleId);
      if (!currentMileage) {
        return false; // No hay datos de kilometraje
      }

      const lastMaintenance = vehicle.maintenances[0];
      const lastMaintenanceMileage = lastMaintenance?.currentMileage || 0;
      const mileageDifference = currentMileage - lastMaintenanceMileage;

      return (
        mileageDifference >= vehicle.maintenanceSchedule.intervalKilometers
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }

  async getVehicleLastFuelConsumption(vehicleId: string): Promise<{
    mileage: number;
    consumedAt: Date;
  } | null> {
    try {
      const fuelConsumption = await this.prisma.fuelConsumption.findFirst({
        where: { vehicleId },
        orderBy: { consumedAt: "desc" },
        select: {
          mileage: true,
          consumedAt: true,
        },
      });

      if (!fuelConsumption || fuelConsumption.mileage === null) {
        return null;
      }

      return {
        mileage: fuelConsumption.mileage,
        consumedAt: fuelConsumption.consumedAt,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer();
    }
  }
}
