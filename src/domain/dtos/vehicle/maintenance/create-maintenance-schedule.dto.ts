import { Validators } from "../../../../config/validators";

export class CreateMaintenanceScheduleDto {
  constructor(
    public vehicleId: string,
    public intervalMonths: number,
    public intervalKilometers?: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateMaintenanceScheduleDto?] {
    const { vehicle_id, interval_months, interval_kilometers } = object;

    if (!vehicle_id || interval_months === undefined) {
      return [
        "El ID del vehículo y el intervalo de meses son requeridos",
        undefined,
      ];
    }

    if (!Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (!Validators.isPositiveInteger(interval_months)) {
      return [
        "El intervalo de meses debe ser un número entero positivo",
        undefined,
      ];
    }

    if (interval_months > 24) {
      return ["El intervalo de meses no puede ser mayor a 24", undefined];
    }

    if (
      interval_kilometers !== undefined &&
      !Validators.isPositiveNumber(interval_kilometers)
    ) {
      return [
        "El intervalo de kilómetros debe ser un número positivo",
        undefined,
      ];
    }

    if (interval_kilometers !== undefined && interval_kilometers > 100000) {
      return [
        "El intervalo de kilómetros no puede ser mayor a 100,000",
        undefined,
      ];
    }

    return [
      undefined,
      new CreateMaintenanceScheduleDto(
        vehicle_id,
        interval_months,
        interval_kilometers
      ),
    ];
  }
}
