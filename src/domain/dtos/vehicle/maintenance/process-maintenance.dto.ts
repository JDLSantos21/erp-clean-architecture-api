import { Validators } from "../../../../config";

interface CompletedProcedure {
  procedureId: number;
  isCompleted: boolean;
  cost?: number;
  notes?: string;
}

export class ProcessMaintenanceDto {
  constructor(
    public vehicleId: string,
    public performedDate: Date,
    public completedProcedures: CompletedProcedure[],
    public performedBy?: string,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, ProcessMaintenanceDto?] {
    const {
      vehicle_id,
      performed_date,
      completed_procedures,
      performed_by,
      notes,
    } = object;

    if (!vehicle_id || !performed_date || !completed_procedures) {
      return [
        "El ID del vehículo, fecha de realización y procedimientos completados son requeridos",
        undefined,
      ];
    }

    if (!Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    if (!Validators.isValidDate(performed_date)) {
      return ["La fecha de realización no es válida", undefined];
    }

    const performedDateObj = new Date(performed_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (performedDateObj > today) {
      return ["La fecha de realización no puede ser en el futuro", undefined];
    }

    if (
      !Array.isArray(completed_procedures) ||
      completed_procedures.length === 0
    ) {
      return ["Debe incluir al menos un procedimiento", undefined];
    }

    // Validar cada procedimiento completado
    for (const procedure of completed_procedures) {
      if (!Validators.isPositiveInteger(procedure.procedureId)) {
        return [
          "Todos los IDs de procedimiento deben ser números enteros positivos",
          undefined,
        ];
      }

      if (typeof procedure.isCompleted !== "boolean") {
        return [
          "El estado de completado debe ser verdadero o falso",
          undefined,
        ];
      }

      if (
        procedure.cost !== undefined &&
        !Validators.isPositiveNumber(procedure.cost)
      ) {
        return ["Los costos deben ser números positivos", undefined];
      }

      if (procedure.notes && !Validators.isValidString(procedure.notes)) {
        return ["Las notas de procedimiento deben ser texto válido", undefined];
      }
    }

    if (performed_by && !Validators.isValidString(performed_by)) {
      return ["El campo 'realizado por' debe ser texto válido", undefined];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["Las notas deben ser texto válido", undefined];
    }

    return [
      undefined,
      new ProcessMaintenanceDto(
        vehicle_id,
        performedDateObj,
        completed_procedures,
        performed_by?.trim(),
        notes?.trim()
      ),
    ];
  }
}
