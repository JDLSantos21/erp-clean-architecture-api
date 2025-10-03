import { Validators } from "../../../config";
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

  /**
   * Crea y valida el DTO de consumo de combustible.
   * @param object Body recibido desde la petición.
   * @param userId Id del usuario autenticado (token / middleware auth).
   */
  static create(
    object: { [key: string]: any },
    userId: string
  ): [string?, CreateFuelConsumptionDto?] {
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
      consumed_at,
      vehicle_type,
    } = object;

    // Validación de userId (viene del contexto de autenticación, no del body)
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return ["El ID del usuario autenticado es obligatorio", undefined];
    }
    if (!Validators.uuid.test(userId)) {
      return ["El ID del usuario autenticado no es válido", undefined];
    }

    if (!vehicle_id || !gallons || !vehicle_type) {
      return ["Faltan campos obligatorios", undefined];
    }

    const vehicleTypeArray = Object.values(vehicleType);

    if (!vehicleTypeArray.includes(vehicle_type)) {
      return ["El tipo de vehículo no es válido", undefined];
    }

    if (vehicle_id.trim() === "") {
      return ["El ID del vehículo no puede estar vacío", undefined];
    }

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (typeof gallons !== "number" || gallons <= 0) {
      return ["La cantidad de galones debe ser un número positivo", undefined];
    }

    if (vehicle_type === vehicleType.VEHICLE) {
      if (!mileage) {
        return ["El kilometraje es obligatorio para vehículos", undefined];
      }

      if ((mileage && typeof mileage !== "number") || mileage <= 0) {
        return ["El kilometraje debe ser un número positivo", undefined];
      }

      if (!driver_id) {
        return ["El ID del conductor es obligatorio para vehículos", undefined];
      }

      if (!Validators.uuid.test(driver_id.trim()))
        return ["El ID del conductor no es válido", undefined];

      if (gallons > MAX_GALLONS_PER_CONSUMPTION) {
        return [
          `La cantidad de galones no puede exceder ${MAX_GALLONS_PER_CONSUMPTION} galones por consumo`,
          undefined,
        ];
      }
    }

    let driver_id_final: string | null = driver_id ? driver_id : null;
    let mileage_final: number | null = mileage ? mileage : null;

    if (vehicle_type === vehicleType.PLANT) {
      if (gallons > MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT) {
        return [
          `La cantidad de galones no puede exceder ${MAX_GALLONS_PER_CONSUMPTION_FOR_PLANT} galones por consumo`,
          undefined,
        ];
      }

      driver_id_final = null;
      mileage_final = null;
    }

    if (consumed_at !== undefined) {
      if (isNaN(new Date(consumed_at).getTime())) {
        return ["La fecha de consumo no es válida", undefined];
      }

      if (new Date(consumed_at) > new Date()) {
        return ["La fecha de consumo no puede ser en el futuro", undefined];
      }
    }

    if (notes !== undefined) {
      if (typeof notes !== "string")
        return ["El formato de las notas no es válido", undefined];
      if (notes.trim() === "")
        return ["Las notas no pueden estar vacías", undefined];
      if (notes.length > 500)
        return ["Las notas no pueden exceder los 500 caracteres", undefined];
    }

    if (tank_refill_id !== undefined && isNaN(Number(tank_refill_id))) {
      return ["El ID del reabastecimiento no es válido", undefined];
    }

    return [
      undefined,
      new CreateFuelConsumptionDto(
        vehicle_id,
        gallons,
        userId,
        driver_id_final,
        mileage_final,
        tank_refill_id !== undefined ? Number(tank_refill_id) : undefined,
        notes,
        consumed_at ? new Date(consumed_at) : undefined
      ),
    ];
  }
}
