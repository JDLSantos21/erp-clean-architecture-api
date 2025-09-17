import { periodOptions } from "../../constants";
import { Period } from "../../entities/VehicleAnalytics";

export class VehicleMetricsDto {
  constructor(
    public vehicleId: string,
    public period: Period = "monthly",
    public startDate?: string,
    public endDate?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, VehicleMetricsDto?] {
    const { vehicleId, period = "monthly", start_date, end_date } = object;

    if (!vehicleId) {
      return ["El ID del vehículo es obligatorio"];
    }

    if (!periodOptions.includes(period)) {
      return ["El período debe ser uno de: daily, weekly, monthly, yearly"];
    }

    if (start_date && isNaN(Date.parse(start_date))) {
      return ["Fecha de inicio con formato inválido"];
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      return ["Fecha de fin con formato inválido"];
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return ["La fecha de inicio no puede ser posterior a la fecha de fin"];
    }

    return [
      undefined,
      new VehicleMetricsDto(vehicleId, period, start_date, end_date),
    ];
  }
}
