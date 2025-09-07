import {
  VehicleDatasource,
  CustomError,
  RegisterVehicleDto,
  Vehicle,
} from "../../domain";

import { prisma } from "../../data/postgresql";
import { buildWhere } from "../mappers/prisma-where.mapper";

export class VehicleDatasourceImpl extends VehicleDatasource {
  async createVehicle(data: RegisterVehicleDto): Promise<Vehicle> {
    try {
      const registeredVehicle = await prisma.$transaction(async (prisma) => {
        const vehicle = await prisma.vehicle.create({ data });

        const { id, currentTag } = vehicle;

        await prisma.vehicleTagHistory.create({
          data: { tag: currentTag, vehicleId: id },
        });

        return vehicle;
      });

      return new Vehicle(registeredVehicle);
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
        prisma.vehicle.findMany({ skip, take: limit, where }),
        prisma.vehicle.count({ where }),
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

    await prisma.vehicle.delete({
      where: {
        id,
      },
    });
  }

  async findByChasis(chasis: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        chasis,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        licensePlate,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async findByCurrentTag(currentTag: string): Promise<Vehicle | null> {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        currentTag,
      },
    });

    return vehicle ? new Vehicle(vehicle) : null;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!vehicle) throw CustomError.notFound("Vehicle not found");

    return new Vehicle(vehicle);
  }

  async updateVehicle(id: string, data: RegisterVehicleDto): Promise<Vehicle> {
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    return new Vehicle(vehicle);
  }
}
