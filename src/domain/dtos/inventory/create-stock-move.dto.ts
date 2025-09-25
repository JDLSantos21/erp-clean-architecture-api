import { Validators } from "../../../config";
import { StockMoveType } from "../../entities/Inventory";

export class CreateStockMoveDto {
  constructor(
    public materialId: number,
    public type: StockMoveType,
    public quantity: number,
    public userId: string,
    public date?: Date,
    public description?: string,
    public newStock?: number,
    public previousStock?: number
  ) {}

  static create(
    object: {
      [key: string]: any;
    },
    userId: string
  ): [string?, CreateStockMoveDto?] {
    const { material_id, type, quantity, date, description } = object;

    if (!userId) return ["El ID del usuario es obligatorio", undefined];

    if (!Validators.uuid.test(userId))
      return ["El ID del usuario no es válido", undefined];

    if (!material_id || !type || !quantity) {
      return ["Faltan campos obligatorios", undefined];
    }

    const quantityNum = Number(quantity);
    const materialIdNum = Number(material_id);

    if (isNaN(materialIdNum) || materialIdNum <= 0) {
      return ["El ID del material no es válido", undefined];
    }

    const validTypes: StockMoveType[] = ["ENTRADA", "SALIDA", "AJUSTE"];

    if (!validTypes.includes(type)) {
      return ["El tipo de movimiento no es válido", undefined];
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      return ["La cantidad debe ser un número positivo", undefined];
    }

    if (quantityNum > 50) {
      return ["La cantidad no puede ser mayor a 50", undefined];
    }

    if (date) {
      const moveDate = new Date(date);

      if (isNaN(moveDate.getTime())) {
        return ["La fecha no es válida", undefined];
      }

      const now = new Date();

      if (moveDate > now)
        return ["La fecha no puede ser en el futuro", undefined];
    }

    if (description) {
      if (typeof description !== "string" || description.trim() === "") {
        return ["La descripción debe ser una cadena no vacía", undefined];
      }
    }

    return [
      undefined,
      new CreateStockMoveDto(
        materialIdNum,
        type,
        quantityNum,
        userId,
        date ? new Date(date) : undefined,
        description,
        undefined,
        undefined
      ),
    ];
  }
}
