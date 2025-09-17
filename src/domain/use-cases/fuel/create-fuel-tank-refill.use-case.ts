import { CreateFuelTankRefillDto } from "../../dtos";
import { FuelRefill } from "../../entities/Fuel";
import { CustomError } from "../../errors/custom.errors";
import { FuelRepository } from "../../repositories/fuel.repository";

interface CreateFuelTankRefillUseCase {
  execute(data: CreateFuelTankRefillDto): Promise<FuelRefill>;
}

export class CreateFuelTankRefill implements CreateFuelTankRefillUseCase {
  constructor(private readonly fuelRepository: FuelRepository) {}

  async execute(data: CreateFuelTankRefillDto): Promise<FuelRefill> {
    const { gallons } = data;

    const tank = await this.fuelRepository.getTankCurrentStatus();

    if (!tank)
      throw CustomError.notFound(
        "No se ha encontrado el tanque de combustible"
      );

    const { currentLevel, capacity } = tank;

    if (gallons + currentLevel > capacity) {
      throw CustomError.badRequest(
        "La cantidad de galones excede la capacidad del tanque"
      );
    }

    if (gallons + currentLevel < 0) {
      throw CustomError.badRequest(
        "La cantidad de galones no puede ser negativa"
      );
    }

    const payload = {
      ...data,
      previousLevel: currentLevel,
      newLevel: currentLevel + gallons,
    };

    return await this.fuelRepository.createFuelTankRefill(payload);
  }
}
