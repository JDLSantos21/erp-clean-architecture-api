import {
  FuelConsumption,
  FuelTank,
  FuelRefill,
  FuelTankReset,
  CustomError,
} from "../../domain";

/**
 * FuelMapper - Mapper para entidades de combustible
 *
 * Este mapper es responsable de convertir objetos de Prisma a entidades de dominio.
 * Es necesario para:
 * 1. Evitar referencias circulares en la serialización JSON
 * 2. Seguir el principio de Single Responsibility (SRP)
 * 3. Mantener la separación entre la capa de infraestructura y dominio
 * 4. Asegurar que solo se retornen los datos necesarios (principio de Dependency Inversion)
 */
export class FuelMapper {
  /**
   * Convierte un objeto de Prisma a una entidad FuelConsumption del dominio
   * Evita referencias circulares extrayendo solo los campos necesarios
   */
  static fuelConsumptionEntityFromObject(object: {
    [key: string]: any;
  }): FuelConsumption {
    const {
      id,
      vehicleId,
      driverId,
      gallons,
      mileage,
      tankRefillId,
      notes,
      userId,
      consumedAt,
      createdAt,
      updatedAt,
    } = object;

    if (
      !id ||
      !vehicleId ||
      !gallons ||
      !userId ||
      !consumedAt ||
      !createdAt ||
      !updatedAt
    ) {
      throw CustomError.badRequest("Invalid fuel consumption object");
    }

    return new FuelConsumption({
      id,
      vehicleId,
      driverId,
      gallons,
      mileage,
      tankRefillId,
      notes,
      userId,
      consumedAt,
      createdAt,
      updatedAt,
    });
  }

  /**
   * Convierte un objeto de Prisma a una entidad FuelTank del dominio
   */
  static fuelTankEntityFromObject(object: { [key: string]: any }): FuelTank {
    const { id, capacity, currentLevel, minLevel, createdAt, updatedAt } =
      object;

    if (
      !id ||
      !capacity ||
      currentLevel === undefined ||
      !minLevel ||
      !createdAt ||
      !updatedAt
    ) {
      throw CustomError.badRequest("Invalid fuel tank object");
    }

    return new FuelTank({
      id,
      capacity,
      currentLevel,
      minLevel,
      createdAt,
      updatedAt,
    });
  }

  /**
   * Convierte un objeto de Prisma a una entidad FuelRefill del dominio
   */
  static fuelRefillEntityFromObject(object: {
    [key: string]: any;
  }): FuelRefill {
    const {
      id,
      gallons,
      pricePerGallon,
      previousLevel,
      newLevel,
      userId,
      createdAt,
      updatedAt,
    } = object;

    if (
      !id ||
      !gallons ||
      !previousLevel ||
      !newLevel ||
      !userId ||
      !createdAt ||
      !updatedAt
    ) {
      throw CustomError.badRequest("Invalid fuel refill object");
    }

    return new FuelRefill({
      id,
      gallons,
      pricePerGallon,
      previousLevel,
      newLevel,
      userId,
      createdAt,
      updatedAt,
    });
  }

  /**
   * Convierte un objeto de Prisma a una entidad FuelTankReset del dominio
   */
  static fuelTankResetEntityFromObject(object: {
    [key: string]: any;
  }): FuelTankReset {
    const { id, previousLevel, userId, createdAt, updatedAt } = object;

    if (!id || !previousLevel || !userId || !createdAt || !updatedAt) {
      throw CustomError.badRequest("Invalid fuel tank reset object");
    }

    return new FuelTankReset({
      id,
      previousLevel,
      userId,
      createdAt,
      updatedAt,
    });
  }
}
