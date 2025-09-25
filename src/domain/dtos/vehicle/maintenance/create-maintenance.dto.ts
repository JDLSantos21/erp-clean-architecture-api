import { Validators } from "../../../../config/validators";

export class CreateMaintenanceDto {
  constructor(
    public vehicleId: string,
    public scheduledDate: Date,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateMaintenanceDto?] {
    const { vehicle_id, scheduled_date, notes } = object;

    if (!vehicle_id || !scheduled_date) {
      return [
        "El ID del vehículo y la fecha programada son requeridos",
        undefined,
      ];
    }

    if (!Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (!Validators.isValidDate(scheduled_date)) {
      return ["La fecha programada no es válida", undefined];
    }

    const scheduledDateObj = new Date(scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduledDateObj < today) {
      return ["La fecha programada no puede ser en el pasado", undefined];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["Las notas deben ser texto válido", undefined];
    }

    if (notes && notes.trim().length > 1000) {
      return ["Las notas no pueden tener más de 1000 caracteres", undefined];
    }

    return [
      undefined,
      new CreateMaintenanceDto(vehicle_id, scheduledDateObj, notes?.trim()),
    ];
  }
}
