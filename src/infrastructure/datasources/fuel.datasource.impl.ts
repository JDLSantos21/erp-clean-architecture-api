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
import { PrismaClient } from "@prisma/client";

interface FiltersParams {
  filters?: Partial<FuelConsumption>;
  skip?: number;
  limit?: number;
}

export class FuelDatasourceImpl extends FuelDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async createFuelTank(data: CreateFuelTankDto): Promise<FuelTank> {
    try {
      const result = await this.prisma.fuelTank.create({
        data: { id: 1, ...data },
      });

      const fuelTank = FuelMapper.fuelTankEntityFromObject(result);

      return fuelTank;
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
      const result = await this.prisma.fuelTank.update({
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

  async getTankCurrentStatus(): Promise<FuelTank | null> {
    try {
      const result = await this.prisma.fuelTank.findUnique({
        where: { id: 1 },
      });
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
      const insertedConsumption = await this.prisma.$transaction(
        async (prisma) => {
          const createdConsumption = await this.prisma.fuelConsumption.create({
            data,
            include: {
              driver: { select: { id: true, name: true, lastName: true } },
              user: { select: { id: true, name: true, lastName: true } },
              vehicle: { select: { id: true, currentTag: true } },
            },
          });

          await this.prisma.fuelTank.update({
            where: { id: 1 },
            data: { currentLevel: { decrement: createdConsumption.gallons } },
          });

          return createdConsumption;
        }
      );

      const consumptionEntity =
        FuelMapper.fuelConsumptionEntityFromObject(insertedConsumption);

      return consumptionEntity;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async updateFuelConsumption(
    id: number,
    data: UpdateFuelConsumptionDto
  ): Promise<FuelConsumption | null> {
    try {
      const result = await this.prisma.fuelConsumption.update({
        where: { id },
        data,
        include: {
          driver: { select: { id: true, name: true, lastName: true } },
          user: { select: { id: true, name: true, lastName: true } },
          vehicle: { select: { id: true, currentTag: true } },
        },
      });

      return result ? FuelMapper.fuelConsumptionEntityFromObject(result) : null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async findFuelConsumptionById(id: number): Promise<FuelConsumption | null> {
    try {
      const result = await this.prisma.fuelConsumption.findUnique({
        where: { id },
        include: {
          driver: { select: { id: true, name: true, lastName: true } },
          user: { select: { id: true, name: true, lastName: true } },
          vehicle: { select: { id: true, currentTag: true } },
        },
      });

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
      await this.prisma.$transaction(async (prisma) => {
        const consumption = await this.prisma.fuelConsumption.findUnique({
          where: { id },
        });

        if (!consumption)
          throw CustomError.notFound(
            "No se ha encontrado el consumo de combustible"
          );

        await this.prisma.fuelConsumption.delete({ where: { id } });

        await this.prisma.fuelTank.update({
          where: { id: 1 },
          data: { currentLevel: { increment: consumption.gallons } },
        });
      });
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
    const { vehicleId, ...validFilters } = filters!;

    const where = buildWhere(validFilters, [""], "consumedAt"); //todo: mejorar filtros

    try {
      const [consumptions, totalPages] = await Promise.all([
        this.prisma.fuelConsumption.findMany({
          where: {
            ...where,
            vehicleId: filters?.vehicleId
              ? { equals: filters.vehicleId }
              : undefined,
          },
          orderBy: { consumedAt: "desc" },
          skip,
          take: limit,
          include: {
            driver: { select: { id: true, name: true, lastName: true } },
            user: { select: { id: true, name: true, lastName: true } },
            vehicle: { select: { id: true, currentTag: true } },
          },
        }),
        this.prisma.fuelConsumption.count({ where }),
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

  async findAllTankRefills(
    params: FiltersParams
  ): Promise<{ refills: FuelRefill[]; totalPages: number }> {
    const { filters, skip, limit } = params;

    const where = buildWhere(
      filters!,
      ["vehicleId", "driverId", "userId", "previousLevel", "newLevel"],
      "createdAt"
    );

    try {
      const [refills, totalPages] = await Promise.all([
        this.prisma.fuelRefill.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: { select: { id: true, name: true, lastName: true } },
          },
        }),
        this.prisma.fuelRefill.count({ where }),
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

  async resetFuelTankLevel(userId: string): Promise<FuelTankReset | null> {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const currentTank = await this.prisma.fuelTank.findUnique({
          where: { id: 1 },
        });

        if (!currentTank) {
          throw CustomError.notFound("No se encontró el tanque de combustible");
        }

        if (currentTank.currentLevel === 0) {
          throw CustomError.badRequest(
            "El nivel del tanque ya está en cero, no es necesario reiniciarlo"
          );
        }

        const resetInfo = await this.prisma.fuelTankReset.create({
          data: { userId, previousLevel: currentTank.currentLevel },
        });

        await this.prisma.fuelTank.update({
          where: { id: 1 },
          data: { currentLevel: 0 },
        });

        return resetInfo;
      });

      return FuelMapper.fuelTankResetEntityFromObject(result);
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
      const result = await this.prisma.fuelConsumption.findFirst({
        where: { vehicleId },
        orderBy: { consumedAt: "desc" },
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
      const result = await this.prisma.fuelConsumption.findFirst({
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
      const result = await this.prisma.fuelConsumption.findFirst({
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
      const tankRefill = await this.prisma.$transaction(async (prisma) => {
        const refill = await this.prisma.fuelRefill.create({
          data: {
            ...data,
            previousLevel: data.previousLevel!,
            newLevel: data.newLevel!,
          },
          include: {
            user: { select: { id: true, name: true, lastName: true } },
          },
        });

        await this.prisma.fuelTank.update({
          where: { id: 1 },
          data: { currentLevel: { increment: refill.gallons } },
        });

        return refill;
      });

      return FuelMapper.fuelRefillEntityFromObject(tankRefill);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async deleteFuelTankRefill(id: number): Promise<void> {
    try {
      await this.prisma.fuelRefill.delete({ where: { id } });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw CustomError.internalServer(undefined, error);
    }
  }

  async getFuelTankRefillById(
    id: number,
    Consumptions: boolean = false
  ): Promise<FuelRefill | null> {
    try {
      const result = await this.prisma.fuelRefill.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, lastName: true },
          },
          Consumptions,
        },
      });

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
      const result = await this.prisma.fuelRefill.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, lastName: true } },
        },
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
