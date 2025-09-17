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

  static create(
    object: {
      [key: string]: any;
    },
    userId: string
  ): [string?, CreateFuelTankRefillDto?] {
    const { gallons, price_per_gallon } = object;

    if (!gallons || !userId || !price_per_gallon) {
      return ["Faltan campos obligatorios", undefined];
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return ["El ID del usuario autenticado es obligatorio", undefined];
    }

    if (!Validators.uuid.test(userId)) {
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
      new CreateFuelTankRefillDto(gallons, userId, price_per_gallon),
    ];
  }
}
