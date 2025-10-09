import { Validators } from "../../../../config";

export class UpdateEquipmentModelDto {
  private constructor(
    public name?: string,
    public brand?: string,
    public capacity?: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateEquipmentModelDto?] {
    const { name, brand, capacity } = object;
    if (!Validators.hasAtLeastOneField({ name, brand, capacity })) {
      return ["Se requiere al menos un campo para actualizar", undefined];
    }

    if (name && !Validators.isValidString(name)) {
      return ["El formato del nombre no es válido", undefined];
    }

    if (brand && !Validators.isValidString(brand)) {
      return ["El formato de la marca no es válido", undefined];
    }

    if (capacity && !Validators.isPositiveInteger(capacity)) {
      return ["El formato de la capacidad no es válido", undefined];
    }

    return [
      undefined,
      new UpdateEquipmentModelDto(name?.trim(), brand?.trim(), capacity),
    ];
  }
}
