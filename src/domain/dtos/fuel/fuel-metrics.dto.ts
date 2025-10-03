import { periodOptions } from "../../constants";
import { Period } from "../../entities";

export class FuelMetricsDto {
  constructor(
    public period: Period,
    public startDate?: string,
    public endDate?: string,
    public vehicleId?: string,
    public driverId?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, FuelMetricsDto?] {
    const { period, startDate, endDate, vehicleId, driverId } = object;

    if (!period || !periodOptions.includes(period)) {
      return ["El período debe ser uno de: daily, weekly, monthly, yearly"];
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return ["Fecha de inicio con formato inválido"];
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return ["Fecha de fin con formato inválido"];
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return ["La fecha de inicio no puede ser posterior a la fecha de fin"];
    }

    return [
      undefined,
      new FuelMetricsDto(period, startDate, endDate, vehicleId, driverId),
    ];
  }
}
