import { Validators } from "../../../config";

export class UpdateMaterialDto {
  constructor(
    public name?: string,
    public categoryId?: number,
    public unitId?: number,
    public minimumStock?: number,
    public description?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateMaterialDto?] {
    const { name, category_id, unit_id, minimum_stock, description } = object;

    if (
      !Validators.hasAtLeastOneField({
        name,
        category_id,
        unit_id,
        minimum_stock,
        description,
      })
    )
      return ["Se requiere al menos un campo para actualizar", undefined];

    if (name && !Validators.isValidString(name))
      return ["El nombre debe ser una cadena no vacía", undefined];

    if (category_id && !Validators.isPositiveInteger(category_id))
      return ["El ID de la categoría no es válido", undefined];

    if (unit_id && !Validators.isPositiveInteger(unit_id))
      return ["El ID de la unidad no es válido", undefined];

    if (minimum_stock && !Validators.isPositiveNumber(minimum_stock))
      return ["El stock mínimo debe ser un número no negativo", undefined];

    if (description && !Validators.isValidString(description))
      return ["La descripción debe ser una cadena", undefined];

    return [
      undefined,
      new UpdateMaterialDto(
        name ? name.trim() : undefined,
        category_id ? Number(category_id) : undefined,
        unit_id ? Number(unit_id) : undefined,
        minimum_stock ? Number(minimum_stock) : undefined,
        description ? description.trim() : undefined
      ),
    ];
  }
}
