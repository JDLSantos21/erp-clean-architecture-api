import { prisma } from "../../data/postgresql";
import {
  CreateFuelConsumptionDto,
  CreateFuelTankDto,
  CreateFuelTankRefillDto,
  CreateUpdateFuelTankDto,
  CustomError,
  FuelConsumption,
  FuelDatasource,
  FuelRefill,
  FuelTank,
  FuelTankReset,
  UpdateFuelConsumptionDto,
  UpdateFuelTankDto,
} from "../../domain";
import { buildWhere } from "../mappers/prisma-where.mapper";
import { FuelMapper } from "../mappers/fuel.mapper";

interface FiltersParams {
  filters?: Partial<FuelConsumption>;
  skip?: number;
  limit?: number;
}

export class FuelDatasourceImpl extends FuelDatasource {
  async createFuelTank(data: CreateFuelTankDto): Promise<FuelTank> {
    try {
      const result = await prisma.fuelTank.create({ data: { id: 1, ...data } });
      return FuelMapper.fuelTankEntityFromObject(result);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async updateFuelTank(
    id: number,
    params: CreateUpdateFuelTankDto
  ): Promise<FuelTank | null> {
    const updateData: Partial<UpdateFuelTankDto> = {};

    if (params.currentLevel !== undefined)
      updateData.currentLevel = params.currentLevel;
    if (params.capacity !== undefined) updateData.capacity = params.capacity;

    if (params.minLevel !== undefined) updateData.minLevel = params.minLevel;

    try {
      const result = await prisma.fuelTank.update({
        where: { id },
        data: updateData,
      });
      return FuelMapper.fuelTankEntityFromObject(result);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async getCurrentFuelTankStatus(): Promise<FuelTank | null> {
    try {
      const result = await prisma.fuelTank.findUnique({ where: { id: 1 } });
      return result ? FuelMapper.fuelTankEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async createFuelConsumption(
    data: CreateFuelConsumptionDto
  ): Promise<FuelConsumption> {
    try {
      const fuelConsumption = await prisma.$transaction(async (prisma) => {
        // Crear objeto solo con campos definidos - siguiendo principio de responsabilidad única
        interface CreateFuelConsumptionData {
          vehicleId: string;
          gallons: number;
          userId: string;
          driverId?: string;
          mileage?: number;
          tankRefillId?: number;
          notes?: string;
          consumedAt?: Date;
        }

        const createData: CreateFuelConsumptionData = {
          vehicleId: data.vehicleId,
          gallons: data.gallons,
          userId: data.userId,
        };

        // Solo agregar driverId si no es null ni undefined
        if (data.driverId !== undefined && data.driverId !== null) {
          createData.driverId = data.driverId;
        }

        // Solo agregar campos opcionales si no son undefined ni null
        if (data.mileage !== undefined && data.mileage !== null) {
          createData.mileage = data.mileage;
        }

        if (data.tankRefillId !== undefined) {
          createData.tankRefillId = data.tankRefillId;
        }

        if (data.notes !== undefined) {
          createData.notes = data.notes;
        }

        if (data.consumedAt !== undefined) {
          createData.consumedAt = data.consumedAt;
        }

        const consumption = await prisma.fuelConsumption.create({
          data: createData,
        });

        await prisma.fuelTank.update({
          where: { id: 1 },
          data: { currentLevel: { decrement: consumption.gallons } },
        });

        // Convertir el resultado de Prisma a entidad de dominio para evitar referencias circulares
        return FuelMapper.fuelConsumptionEntityFromObject(consumption);
      });

      return fuelConsumption;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  updateFuelConsumption(
    id: number,
    data: UpdateFuelConsumptionDto
  ): Promise<FuelConsumption | null> {
    throw new Error("Method not implemented.");
  }

  async findFuelConsumptionById(id: number): Promise<FuelConsumption | null> {
    try {
      const result = await prisma.fuelConsumption.findUnique({ where: { id } });
      return result ? FuelMapper.fuelConsumptionEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async deleteFuelConsumption(id: number): Promise<void> {
    try {
      await prisma.fuelConsumption.delete({ where: { id } });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async findAllFuelConsumptions(
    params: FiltersParams
  ): Promise<{ consumptions: FuelConsumption[]; totalPages: number }> {
    const { filters, skip, limit } = params;

    const where = buildWhere(filters!, [
      "vehicleId",
      "driverId",
      "userId",
      "tankRefillId",
      "consumedAt",
      "createdAt",
    ]);

    try {
      const [consumptions, totalPages] = await Promise.all([
        prisma.fuelConsumption.findMany({
          where,
          skip,
          take: limit,
        }),
        prisma.fuelConsumption.count({ where }),
      ]);

      return {
        consumptions: consumptions.map((c) =>
          FuelMapper.fuelConsumptionEntityFromObject(c)
        ),
        totalPages,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async getFuelTankRefills(
    params: FiltersParams
  ): Promise<{ refills: FuelRefill[]; totalPages: number }> {
    const { filters, skip, limit } = params;

    const where = buildWhere(filters!, [
      "vehicleId",
      "driverId",
      "userId",
      "previousLevel",
      "newLevel",
      "createdAt",
    ]);

    try {
      const [refills, totalPages] = await Promise.all([
        prisma.fuelRefill.findMany({
          where,
          skip,
          take: limit,
        }),
        prisma.fuelRefill.count({ where }),
      ]);
      return {
        refills: refills.map((r) => FuelMapper.fuelRefillEntityFromObject(r)),
        totalPages,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async resetFuelTankLevel(
    previousLevel: number,
    userId: string
  ): Promise<FuelTankReset | null> {
    try {
      const updatedTank = await prisma.fuelTank.update({
        where: { id: 1 },
        data: { currentLevel: 0 },
      });

      const resetData = {
        id: updatedTank.id,
        previousLevel,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return FuelMapper.fuelTankResetEntityFromObject(resetData);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  createOrUpdateFuelTankLevel(
    params: CreateUpdateFuelTankDto
  ): Promise<FuelTank> {
    throw new Error("Method not implemented.");
  }

  async findVehicleLastConsumption(
    vehicleId: string
  ): Promise<FuelConsumption | null> {
    try {
      const result = await prisma.fuelConsumption.findFirst({
        where: { vehicleId },
        orderBy: { createdAt: "desc" },
      });
      return result ? FuelMapper.fuelConsumptionEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async findVehicleNextConsumption(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null> {
    try {
      const result = await prisma.fuelConsumption.findFirst({
        where: { vehicleId, id: { gt: consumptionId } },
        orderBy: { createdAt: "asc" },
      });
      return result ? FuelMapper.fuelConsumptionEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async findVehicleLastConsumptionExcluding(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null> {
    try {
      const result = await prisma.fuelConsumption.findFirst({
        where: { vehicleId, id: { lt: consumptionId } },
        orderBy: { createdAt: "desc" },
      });
      return result ? FuelMapper.fuelConsumptionEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async createFuelTankRefill(
    data: CreateFuelTankRefillDto
  ): Promise<FuelRefill> {
    try {
      const result = await prisma.fuelRefill.create({
        data: {
          ...data,
          previousLevel: data.previousLevel!,
          newLevel: data.newLevel!,
        },
      });
      return FuelMapper.fuelRefillEntityFromObject(result);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async deleteFuelTankRefill(id: number): Promise<void> {
    try {
      await prisma.fuelRefill.delete({ where: { id } });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async getFuelTankRefillById(id: number): Promise<FuelRefill | null> {
    try {
      const result = await prisma.fuelRefill.findUnique({ where: { id } });
      return result ? FuelMapper.fuelRefillEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async findLastTankRefill(): Promise<FuelRefill | null> {
    try {
      const result = await prisma.fuelRefill.findFirst({
        orderBy: { createdAt: "desc" },
      });
      return result ? FuelMapper.fuelRefillEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }
}
