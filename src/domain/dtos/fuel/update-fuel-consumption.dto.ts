import { Validators } from "../../../config";
import { FuelConstants } from "../../constants";

export class UpdateFuelConsumptionDto {
  constructor(
    public gallons?: number,
    public mileage?: number,
    public userId?: string,
    public tankRefillId?: number,
    public notes?: string,
    public consumedAt?: Date,
    public vehicleType?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateFuelConsumptionDto?] {
    const {
      vehicleType,
      MAX_GALLONS_PER_CONSUMPTION,
      MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT,
    } = FuelConstants;

    // se necesita añadir un campo para saber si es para planta o vehiculo
    // para validar la cantidad de galones
    const {
      gallons,
      mileage,
      notes,
      user_id,
      consumed_at,
      tank_refill_id,
      vehicle_type,
    } = object;

    const hasAtLeastOneField = Validators.hasAtLeastOneField({
      gallons,
      mileage,
      notes,
      user_id,
      consumed_at,
      tank_refill_id,
    });

    if (!hasAtLeastOneField) {
      return ["Debe proporcionar al menos un campo para actualizar", undefined];
    }

    if (gallons !== undefined) {
      if (typeof gallons !== "number" || gallons <= 0) {
        return [
          "La cantidad de galones debe ser un número positivo",
          undefined,
        ];
      }
      if (
        vehicle_type === vehicleType.VEHICLE &&
        gallons > MAX_GALLONS_PER_CONSUMPTION
      ) {
        return [
          `La cantidad de galones no puede ser mayor a ${MAX_GALLONS_PER_CONSUMPTION}`,
          undefined,
        ];
      } else if (
        vehicle_type === vehicleType.PLANT &&
        gallons > MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT
      ) {
        return [
          `La cantidad de galones no puede ser mayor a ${MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT}`,
          undefined,
        ];
      }
    }

    if (mileage !== undefined) {
      if (typeof mileage !== "number" || mileage <= 0) {
        return ["El kilometraje debe ser un número positivo", undefined];
      }
    }

    if (user_id !== undefined && !Validators.uuid.test(user_id)) {
      return ["El ID del usuario no es válido", undefined];
    }

    if (tank_refill_id !== undefined) {
      if (isNaN(tank_refill_id) || tank_refill_id <= 0) {
        return ["El ID de recarga de tanque no es válido", undefined];
      }
    }

    if (consumed_at !== undefined) {
      const date = new Date(consumed_at);
      if (isNaN(date.getTime())) {
        return ["La fecha de consumo no es válida", undefined];
      }
    }

    if (notes !== undefined) {
      if (typeof notes !== "string")
        return ["Las notas deben ser una cadena de texto", undefined];
      if (notes.trim() === "")
        return ["Las notas no pueden estar vacías", undefined];
      if (notes.length > 500)
        return ["Las notas no pueden exceder los 500 caracteres", undefined];
    }

    return [
      undefined,
      new UpdateFuelConsumptionDto(
        gallons,
        mileage,
        user_id,
        tank_refill_id,
        notes,
        consumed_at
      ),
    ];
  }
}
