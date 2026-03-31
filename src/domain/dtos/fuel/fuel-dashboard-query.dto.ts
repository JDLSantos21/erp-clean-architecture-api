import { Validators } from "../../../config";

export class FuelDashboardQueryDto {
  constructor(
    public startDate?: string,
    public endDate?: string,
    public vehicleId?: string,
    public alertThreshold: number = 1.5,
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, FuelDashboardQueryDto?] {
    const { start_date, end_date, vehicle_id, alert_threshold } = object;

    if (start_date && isNaN(Date.parse(start_date))) {
      return ["Fecha de inicio con formato inválido"];
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      return ["Fecha de fin con formato inválido"];
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return ["La fecha de inicio no puede ser posterior a la fecha de fin"];
    }

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["ID de vehículo inválido"];
    }

    const threshold = alert_threshold ? Number(alert_threshold) : 1.5;
    if (isNaN(threshold) || threshold <= 0) {
      return ["El umbral de alerta debe ser un número positivo"];
    }

    return [
      undefined,
      new FuelDashboardQueryDto(start_date, end_date, vehicle_id, threshold),
    ];
  }
}
