import { Validators } from "../../../../config";

export class MaintenanceReportDto {
  constructor(
    public vehicleId?: string,
    public dateFrom?: Date,
    public dateTo?: Date,
    public status?: string,
    public includeIncomplete?: boolean
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, MaintenanceReportDto?] {
    const { vehicle_id, date_from, date_to, status, include_incomplete } =
      object;

    if (vehicle_id && !Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
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

    if (
      include_incomplete !== undefined &&
      typeof include_incomplete !== "boolean"
    ) {
      return [
        "El campo incluir incompletos debe ser verdadero o falso",
        undefined,
      ];
    }

    return [
      undefined,
      new MaintenanceReportDto(
        vehicle_id,
        dateFromObj,
        dateToObj,
        status,
        include_incomplete
      ),
    ];
  }
}
