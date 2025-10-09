import { Validators } from "../../../../config";
import { EQUIPMENT_TYPE } from "../../../constants";
import { EquipmentType } from "../../../entities";

export class CreateEquipmentModelDto {
  private constructor(
    public name: string,
    public type: EquipmentType,
    public brand?: string,
    public capacity?: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateEquipmentModelDto?] {
    const { name, type, brand, capacity } = object;

    if (!name || !type) {
      return ["Faltan campos requeridos", undefined];
    }

    if (!Validators.isValidString(name)) {
      return ["", undefined];
    }

    if (brand && !Validators.isValidString(brand)) {
      return ["El formato de la marca no es válido", undefined];
    }

    if (capacity && !Validators.isPositiveInteger(capacity)) {
      return ["El formato de la capacidad no es válido", undefined];
    }

    if (!Object.values(EQUIPMENT_TYPE).includes(type)) {
      return ["El tipo de equipo no es válido", undefined];
    }

    return [
      undefined,
      new CreateEquipmentModelDto(name.trim(), type, brand?.trim(), capacity),
    ];
  }
}
