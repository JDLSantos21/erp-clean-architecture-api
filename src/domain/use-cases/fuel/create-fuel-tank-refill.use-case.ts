import { CreateFuelTankRefillDto } from "../../dtos";
import { FuelRefill } from "../../entities/Fuel";
import { CustomError } from "../../errors/custom.errors";
import { AuthRepository } from "../../repositories/auth.repository";
import { FuelRepository } from "../../repositories/fuel.repository";

interface CreateFuelTankRefillUseCase {
  execute(data: CreateFuelTankRefillDto): Promise<FuelRefill>;
}

export class CreateFuelTankRefill implements CreateFuelTankRefillUseCase {
  constructor(
    private readonly fuelRepository: FuelRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async execute(data: CreateFuelTankRefillDto): Promise<FuelRefill> {
    const { gallons, userId } = data;

    const [tank, user] = await Promise.all([
      this.fuelRepository.getCurrentFuelTankStatus(),
      this.authRepository.findById(userId),
    ]);

    if (!tank)
      throw CustomError.notFound(
        "No se ha encontrado el tanque de combustible"
      );

    if (!user) throw CustomError.notFound("Usuario no encontrado");

    const { currentLevel, capacity } = tank;

    if (gallons + currentLevel > capacity) {
      throw CustomError.badRequest(
        "La cantidad de galones excede la capacidad del tanque"
      );
    }

    const refillData = {
      ...data,
      previousLevel: currentLevel,
      newLevel: currentLevel + gallons,
    };

    return await this.fuelRepository.createFuelTankRefill(refillData);
  }
}
