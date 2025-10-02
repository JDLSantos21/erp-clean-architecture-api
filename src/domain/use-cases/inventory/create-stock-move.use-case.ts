import { CreateStockMoveDto } from "../../dtos";
import { StockMove } from "../../entities";
import { CustomError } from "../../errors";
import { InventoryRepository } from "../../repositories";

interface CreateStockMoveUseCase {
  execute(data: CreateStockMoveDto): Promise<StockMove | null>;
}

export class CreateStockMove implements CreateStockMoveUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(data: CreateStockMoveDto): Promise<StockMove | null> {
    const payload = {
      ...data,
    };

    const material = await this.inventoryRepository.getMaterialById(
      data.materialId
    );

    if (!material) throw CustomError.notFound("El material no existe");

    if (data.type === "SALIDA") {
      payload.quantity = -Math.abs(data.quantity);
      payload.newStock = material.stock + payload.quantity;
    }
    if (data.type === "ENTRADA") {
      payload.quantity = Math.abs(data.quantity);
      payload.newStock = material.stock + payload.quantity;
    }
    if (data.type === "AJUSTE") {
      payload.newStock = data.quantity;

      if (payload.newStock === material.stock)
        throw CustomError.badRequest(
          "El nuevo stock no puede ser igual al stock actual"
        );
    }

    if (payload.newStock! < 0)
      throw CustomError.badRequest("No hay suficiente stock disponible");

    payload.previousStock = material.stock;

    return this.inventoryRepository.createStockMove(payload);
  }
}
