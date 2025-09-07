import { CreateFuelConsumptionDto } from "../../dtos";
import { FuelConsumption } from "../../entities/Fuel";
import { CustomError } from "../../errors/custom.errors";
import { FuelRepository } from "../../repositories/fuel.repository";

interface CreateFuelConsumptionUseCase {
  execute(data: CreateFuelConsumptionDto): Promise<FuelConsumption>;
}

export class CreateFuelConsumption implements CreateFuelConsumptionUseCase {
  constructor(private readonly fuelRepository: FuelRepository) {}

  async execute(data: CreateFuelConsumptionDto): Promise<FuelConsumption> {
    const { vehicleId, mileage, tankRefillId, gallons } = data;

    const fuelTank = await this.fuelRepository.getCurrentFuelTankStatus();

    if (!fuelTank)
      throw CustomError.badRequest(
        "No se puede registrar el consumo de combustible sin un tanque de combustible."
      );

    if (fuelTank.currentLevel === 0)
      throw CustomError.badRequest(
        "No se puede registrar el consumo de combustible con el tanque vacío."
      );

    if (fuelTank.currentLevel < gallons)
      throw CustomError.badRequest(
        "No se puede registrar el consumo de combustible que exceda el nivel actual del tanque."
      );

    const vehicleLastConsumption =
      await this.fuelRepository.findVehicleLastConsumption(vehicleId);

    let tank_refill_id: number | undefined = tankRefillId;

    if (!tankRefillId) {
      const lastTankRefill = await this.fuelRepository.findLastTankRefill();
      if (lastTankRefill) tank_refill_id = lastTankRefill.id;
    }

    data.tankRefillId = tank_refill_id;

    if (vehicleLastConsumption && mileage) {
      if (mileage < vehicleLastConsumption.mileage!)
        throw CustomError.badRequest(
          "El kilometraje de combustible no puede ser menor al último registro."
        );

      if (mileage - vehicleLastConsumption.mileage! > 500)
        throw CustomError.badRequest(
          "La diferencia de kilometraje no puede ser mayor a 500."
        );
    }

    return await this.fuelRepository.createFuelConsumption(data);
  }
}
