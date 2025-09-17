// filters for search (vehicle_tag), vehicle_id, driver_id, consumed_at (date range, [start_at, end_at]), limit, page.

import { Validators } from "../../../config";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../../constants";

export class FuelConsumptionQueryDto {
  constructor(
    public page: number,
    public limit: number,
    public vehicleId?: string,
    public driverId?: string,
    public userId?: string,
    public startDate?: string,
    public endDate?: string,
    public search?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, FuelConsumptionQueryDto?] {
    const {
      start_date,
      end_date,
      vehicle_id,
      driver_id,
      user_id,
      search,
      page,
      limit,
    } = object;
    const pageNum = Number(page) || DEFAULT_PAGE;
    const limitNum = Number(limit) || DEFAULT_LIMIT;

    if (isNaN(pageNum) || pageNum < 1) {
      return ["Número de página inválido", undefined];
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return ["Número de límite inválido", undefined];
    }

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["ID de vehículo inválido", undefined];
    }

    if (driver_id && !Validators.uuid.test(driver_id)) {
      return ["ID de conductor inválido", undefined];
    }

    if (user_id && !Validators.uuid.test(user_id)) {
      return ["ID de usuario inválido", undefined];
    }

    if (start_date && isNaN(Date.parse(start_date))) {
      return ["Fecha de inicio inválida", undefined];
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      return ["Fecha de fin inválida", undefined];
    }

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (start > end) {
        return [
          "La fecha de inicio no puede ser mayor a la fecha de fin",
          undefined,
        ];
      }
    }

    if (search && typeof search !== "string" && search.trim() !== "") {
      return ["El término de búsqueda debe ser una cadena de texto", undefined];
    }

    return [
      undefined,
      new FuelConsumptionQueryDto(
        pageNum,
        limitNum,
        vehicle_id,
        driver_id,
        user_id,
        start_date,
        end_date,
        search
      ),
    ];
  }
}
