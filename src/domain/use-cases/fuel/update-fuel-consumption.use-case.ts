import { UpdateFuelConsumptionDto } from "../../dtos";
import { FuelConsumption } from "../../entities";
import { CustomError } from "../../errors";
import { FuelRepository } from "../../repositories";

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

    const { createdAt } = consumption;

    const THIRTY_MINUTES_IN_MILISECONDS = 30 * 60 * 1000;

    if (createdAt < new Date(Date.now() - THIRTY_MINUTES_IN_MILISECONDS)) {
      throw CustomError.badRequest(
        "No se puede editar un registro después de 30 minutos de su creación"
      );
    }

    if (mileage !== undefined || data.consumedAt !== undefined) {
      const previousConsumption =
        await this.fuelRepository.findVehicleLastConsumptionExcluding(
          consumption.vehicleId,
          id
        );

      if (previousConsumption) {
        if (mileage && mileage < previousConsumption.mileage!)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser menor al último registro."
          );

        if (mileage && mileage - previousConsumption.mileage! > 500)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor a 500 km del último registro."
          );

        if (data.consumedAt && previousConsumption.consumedAt > data.consumedAt)
          throw CustomError.badRequest(
            "La fecha de consumo no puede ser menor a la fecha del último registro."
          );
      }

      const nextConsumption =
        await this.fuelRepository.findVehicleNextConsumption(
          consumption.vehicleId,
          id
        );

      if (nextConsumption) {
        if (mileage && mileage > nextConsumption.mileage!)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor al siguiente registro."
          );
        if (mileage && nextConsumption.mileage! - mileage > 500)
          throw CustomError.badRequest(
            "El kilometraje de combustible no puede ser mayor a 500 km del siguiente registro."
          );
        if (data.consumedAt && nextConsumption.consumedAt < data.consumedAt)
          throw CustomError.badRequest(
            "La fecha de consumo no puede ser mayor a la fecha del siguiente registro."
          );
      }
    }

    return await this.fuelRepository.updateFuelConsumption(id, data);
  }
}
