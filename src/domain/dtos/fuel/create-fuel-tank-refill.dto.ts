import { Validators } from "../../../config";
import { FuelConstants } from "../../constants";

export class CreateFuelTankRefillDto {
  constructor(
    public gallons: number,
    public userId: string,
    public pricePerGallon: number,
    public previousLevel?: number,
    public newLevel?: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateFuelTankRefillDto?] {
    const { gallons, user_id, price_per_gallon } = object;

    if (!gallons || !user_id || !price_per_gallon) {
      return ["Faltan campos obligatorios", undefined];
    }

    if (!Validators.uuid.test(user_id)) {
      return ["ID de usuario inválido", undefined];
    }

    if (isNaN(gallons) || gallons <= 0) {
      return ["Cantidad de galones inválida", undefined];
    }

    if (gallons > FuelConstants.MAX_TANK_CAPACITY_GALLONS) {
      return ["La cántidad de galones no puede ser mayor a 1500", undefined];
    }

    if (price_per_gallon && (isNaN(price_per_gallon) || price_per_gallon < 0)) {
      return ["El precio por galón debe ser un número no negativo", undefined];
    }

    return [
      undefined,
      new CreateFuelTankRefillDto(gallons, user_id, price_per_gallon),
    ];
  }
}
