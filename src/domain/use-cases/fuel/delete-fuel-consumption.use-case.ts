import { CustomError } from "../../errors";
import { FuelRepository } from "../../repositories";

interface DeleteFuelConsumptionUseCase {
  execute(id: number): Promise<void>;
}

export class DeleteFuelConsumption implements DeleteFuelConsumptionUseCase {
  constructor(private readonly fuelRepository: FuelRepository) {}

  async execute(id: number): Promise<void> {
    const consumption = await this.fuelRepository.findFuelConsumptionById(id);

    if (!consumption) {
      throw CustomError.notFound(
        "No se ha encontrado el consumo de combustible"
      );
    }

    const currentRefill = await this.fuelRepository.findLastTankRefill();

    if (currentRefill && consumption.consumedAt < currentRefill.createdAt) {
      throw CustomError.badRequest(
        "No se puede eliminar un consumo anterior al último llenado del tanque"
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // establece la hora a las 00:00:00

    if (consumption.createdAt < today) {
      throw CustomError.badRequest(
        "Solo se pueden eliminar consumos del día actual"
      );
    }

    return await this.fuelRepository.deleteFuelConsumption(id);
  }
}
