import { Validators } from "../../../../config/validators";

export class CreateMaintenanceProcedureDto {
  constructor(
    public name: string,
    public category: string,
    public description?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateMaintenanceProcedureDto?] {
    const { name, category, description } = object;

    if (!name || !category) {
      return ["El nombre y la categoría son campos requeridos", undefined];
    }

    if (!Validators.isValidString(name)) {
      return ["El nombre debe ser una cadena válida", undefined];
    }

    if (name.trim().length < 3) {
      return ["El nombre debe tener al menos 3 caracteres", undefined];
    }

    const validCategories = [
      "MOTOR",
      "TRANSMISION",
      "FRENOS",
      "FILTROS",
      "FLUIDOS",
      "LLANTAS",
      "ELECTRICO",
      "CARROCERIA",
      "PREVENTIVO",
    ];

    if (!validCategories.includes(category)) {
      return ["La categoría no es válida", undefined];
    }

    if (description && !Validators.isValidString(description)) {
      return ["La descripción debe ser una cadena válida", undefined];
    }

    return [
      undefined,
      new CreateMaintenanceProcedureDto(
        name.trim(),
        category,
        description?.trim()
      ),
    ];
  }
}
