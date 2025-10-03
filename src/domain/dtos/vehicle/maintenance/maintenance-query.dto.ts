import { Validators } from "../../../../config";

export class MaintenanceQueryDto {
  constructor(
    public page: number = 1,
    public limit: number = 10,
    public vehicleId?: string,
    public status?: string,
    public dateFrom?: Date,
    public dateTo?: Date,
    public sortBy?: string,
    public sortOrder?: "asc" | "desc"
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, MaintenanceQueryDto?] {
    const {
      page = 1,
      limit = 10,
      vehicle_id,
      status,
      date_from,
      date_to,
      sort_by = "createdAt",
      sort_order = "desc",
    } = object;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (!Validators.isPositiveInteger(pageNum)) {
      return ["La página debe ser un número entero positivo", undefined];
    }

    if (!Validators.isPositiveInteger(limitNum)) {
      return ["El límite debe ser un número entero positivo", undefined];
    }

    if (limitNum > 100) {
      return ["El límite no puede ser mayor a 100", undefined];
    }

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (status) {
      const validStatuses = [
        "PROGRAMADO",
        "EN_PROGRESO",
        "COMPLETADO",
        "CANCELADO",
        "VENCIDO",
        "PARCIAL",
      ];

      if (!validStatuses.includes(status)) {
        return ["El estado no es válido", undefined];
      }
    }

    let dateFromObj: Date | undefined;
    let dateToObj: Date | undefined;

    if (date_from) {
      if (!Validators.isValidDate(date_from)) {
        return ["La fecha de inicio no es válida", undefined];
      }
      dateFromObj = new Date(date_from);
    }

    if (date_to) {
      if (!Validators.isValidDate(date_to)) {
        return ["La fecha de fin no es válida", undefined];
      }
      dateToObj = new Date(date_to);
    }

    if (dateFromObj && dateToObj && dateFromObj > dateToObj) {
      return [
        "La fecha de inicio no puede ser mayor que la fecha de fin",
        undefined,
      ];
    }

    const validSortFields = [
      "createdAt",
      "scheduledDate",
      "performedDate",
      "status",
      "totalCost",
    ];

    if (!validSortFields.includes(sort_by)) {
      return ["El campo de ordenamiento no es válido", undefined];
    }

    if (!["asc", "desc"].includes(sort_order)) {
      return ["El orden debe ser 'asc' o 'desc'", undefined];
    }

    return [
      undefined,
      new MaintenanceQueryDto(
        pageNum,
        limitNum,
        vehicle_id,
        status,
        dateFromObj,
        dateToObj,
        sort_by,
        sort_order as "asc" | "desc"
      ),
    ];
  }
}
