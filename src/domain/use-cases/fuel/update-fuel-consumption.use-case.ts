import { UpdateFuelConsumptionDto } from "../../dtos";
import { FuelConsumption } from "../../entities/Fuel";
import { CustomError } from "../../errors/custom.errors";
import { FuelRepository } from "../../repositories/fuel.repository";

interface UpdateFuelConsumptionUseCase {
  execute(
    id: number,
    data: Partial<UpdateFuelConsumptionDto>
  ): Promise<FuelConsumption | null>;
}

export class UpdateFuelConsumption implements UpdateFuelConsumptionUseCase {
  constructor(private readonly fuelRepository: FuelRepository) {}
  async execute(
    id: number,
    data: Partial<UpdateFuelConsumptionDto>
  ): Promise<FuelConsumption | null> {
    const consumption = await this.fuelRepository.findFuelConsumptionById(id);

    if (!consumption) throw new Error("Consumo de combustible no encontrado");

    const { mileage } = data;

    if (mileage !== undefined) {
      const previousConsumption =
        await this.fuelRepository.findVehicleLastConsumptionExcluding(
          consumption.vehicleId,
          id
        );

      if (previousConsumption) {
        if (mileage < previousConsumption.mileage!)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser menor al último registro."
          );

        if (mileage - previousConsumption.mileage! > 500)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor a 500 km del último registro."
          );
      }

      const nextConsumption =
        await this.fuelRepository.findVehicleNextConsumption(
          consumption.vehicleId,
          id
        );

      if (nextConsumption) {
        if (mileage > nextConsumption.mileage!)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor al siguiente registro."
          );
        if (nextConsumption.mileage! - mileage > 500)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor a 500 km del siguiente registro."
          );
      }
    }

    return await this.fuelRepository.updateFuelConsumption(id, data);
  }
}
