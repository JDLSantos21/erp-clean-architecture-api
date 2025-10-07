import { Validators } from "../../../../config";

export class CreateProductDTO {
  private constructor(
    public name: string,
    public unit: string,
    public size?: string,
    public description?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: CreateProductDTO] {
    const { name, unit, size, description } = object;

    if (!name) return ["El nombre del producto es requerido"];

    if (!unit) return ["La unidad del producto es requerida"];

    if (!Validators.isValidString(name)) {
      return ["El nombre del producto debe ser un texto válido"];
    }

    if (!Validators.isValidString(unit)) {
      return ["La unidad del producto debe ser un texto válido"];
    }

    if (
      size !== undefined &&
      size !== null &&
      !Validators.isValidString(size)
    ) {
      return ["El tamaño del producto debe ser un texto válido"];
    }

    if (
      description !== undefined &&
      description !== null &&
      !Validators.isValidString(description)
    ) {
      return ["La descripción del producto debe ser un texto válido"];
    }

    return [
      undefined,
      new CreateProductDTO(
        name.trim(),
        unit.trim(),
        size ? size.trim() : undefined,
        description ? description.trim() : undefined
      ),
    ];
  }
}
