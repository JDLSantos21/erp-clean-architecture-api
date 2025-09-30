import {
  FuelConsumption,
  FuelTank,
  FuelRefill,
  FuelTankReset,
  CustomError,
} from "../../domain";

export class FuelMapper {
  static fuelConsumptionEntityFromObject(object: {
    [key: string]: any;
  }): FuelConsumption {
    const {
      id,
      gallons,
      mileage,
      tankRefillId,
      notes,
      consumedAt,
      createdAt,
      updatedAt,
      driver,
      user,
      vehicle,
    } = object;

    if (!id || !gallons || !consumedAt || !createdAt || !updatedAt) {
      throw CustomError.badRequest("Invalid fuel consumption object");
    }

    return new FuelConsumption({
      id,
      gallons,
      mileage,
      tankRefillId,
      notes,
      driver,
      user,
      vehicle,
      consumedAt,
      createdAt,
      updatedAt,
    });
  }

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

  static fuelRefillEntityFromObject(object: {
    [key: string]: any;
  }): FuelRefill {
    const {
      id,
      gallons,
      pricePerGallon,
      previousLevel,
      newLevel,
      Consumptions: consumptions,
      user,
      createdAt,
      updatedAt,
    } = object;

    if (!id || !gallons || !newLevel || !user || !createdAt || !updatedAt) {
      throw CustomError.badRequest("Invalid fuel refill object");
    }

    return new FuelRefill({
      id,
      gallons,
      pricePerGallon,
      previousLevel,
      newLevel,
      consumptions,
      user,
      createdAt,
      updatedAt,
    });
  }

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
