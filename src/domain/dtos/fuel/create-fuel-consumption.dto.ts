import { Validators } from "../../../config/validators";
import { FuelConstants } from "../../constants";

export class CreateFuelConsumptionDto {
  constructor(
    public vehicleId: string,
    public gallons: number,
    public userId: string,
    public driverId?: string | null,
    public mileage?: number | null,
    public tankRefillId?: number,
    public notes?: string,
    public consumedAt?: Date
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateFuelConsumptionDto?] {
    const {
      vehicleType,
      MAX_GALLONS_PER_CONSUMPTION,
      MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT,
    } = FuelConstants;

    const {
      vehicle_id,
      driver_id,
      tank_refill_id,
      gallons,
      mileage,
      notes,
      user_id,
      consumed_at,
      vehicle_type,
    } = object;

    if (!vehicle_id || !gallons || !user_id || !vehicle_type) {
      return ["Faltan campos obligatorios", undefined];
    }

    // Validar que los IDs obligatorios no sean cadenas vacías
    if (vehicle_id.trim() === "") {
      return ["El ID del vehículo no puede estar vacío", undefined];
    }

    if (user_id.trim() === "") {
      return ["El ID del usuario no puede estar vacío", undefined];
    }

    if (vehicle_type === vehicleType.VEHICLE && !mileage) {
      return ["El kilometraje es obligatorio para vehículos", undefined];
    }

    if (vehicle_type === vehicleType.VEHICLE && !driver_id) {
      return ["El ID del conductor es obligatorio para vehículos", undefined];
    }

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (
      driver_id &&
      driver_id.trim() !== "" &&
      !Validators.uuid.test(driver_id)
    ) {
      return ["El ID del conductor no es válido", undefined];
    }

    if (!Validators.uuid.test(user_id)) {
      return ["El ID del usuario no es válido", undefined];
    }

    if (typeof gallons !== "number" || gallons <= 0) {
      return ["La cantidad de galones debe ser un número positivo", undefined];
    }

    if (
      vehicle_type === vehicleType.VEHICLE &&
      gallons > MAX_GALLONS_PER_CONSUMPTION
    ) {
      return [
        `La cantidad de galones no puede exceder ${MAX_GALLONS_PER_CONSUMPTION} galones por consumo`,
        undefined,
      ];
    }

    if (
      vehicle_type === vehicleType.PLANT &&
      gallons > MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT
    ) {
      return [
        `La cantidad de galones no puede exceder ${MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT} galones por consumo`,
        undefined,
      ];
    }

    if ((mileage && typeof mileage !== "number") || mileage <= 0) {
      return ["El kilometraje debe ser un número positivo", undefined];
    }

    if (notes !== undefined) {
      if (typeof notes !== "string")
        return ["El formato de las notas no es válido", undefined];
      if (notes.trim() === "")
        return ["Las notas no pueden estar vacías", undefined];
      if (notes.length > 500)
        return ["Las notas no pueden exceder los 500 caracteres", undefined];
    }

    if (consumed_at !== undefined && isNaN(new Date(consumed_at).getTime())) {
      return ["La fecha de consumo no es válida", undefined];
    }

    if (tank_refill_id !== undefined && isNaN(Number(tank_refill_id))) {
      return ["El ID del reabastecimiento no es válido", undefined];
    }

    // Convertir driver_id vacío a null
    const cleanedDriverId =
      driver_id && driver_id.trim() !== "" ? driver_id : null;

    return [
      undefined,
      new CreateFuelConsumptionDto(
        vehicle_id,
        gallons,
        user_id,
        cleanedDriverId,
        mileage,
        tank_refill_id,
        notes,
        consumed_at
      ),
    ];
  }
}
