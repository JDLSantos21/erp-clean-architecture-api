import { Validators } from "../../../../config/validators";

export class UpdateMaintenanceItemDto {
  constructor(
    public isCompleted: boolean,
    public cost?: number,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateMaintenanceItemDto?] {
    const { is_completed, cost, notes } = object;

    if (is_completed === undefined) {
      return ["El estado de completado es requerido", undefined];
    }

    if (typeof is_completed !== "boolean") {
      return ["El estado de completado debe ser verdadero o falso", undefined];
    }

    if (cost !== undefined && !Validators.isPositiveNumber(cost)) {
      return ["El costo debe ser un número positivo", undefined];
    }

    if (cost !== undefined && cost > 999999) {
      return ["El costo no puede ser mayor a 999,999", undefined];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["Las notas deben ser texto válido", undefined];
    }

    if (notes && notes.trim().length > 500) {
      return ["Las notas no pueden tener más de 500 caracteres", undefined];
    }

    return [
      undefined,
      new UpdateMaintenanceItemDto(is_completed, cost, notes?.trim()),
    ];
  }
}
