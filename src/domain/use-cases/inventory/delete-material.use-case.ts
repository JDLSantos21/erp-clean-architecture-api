import { CustomError } from "../../errors/custom.errors";
import { InventoryRepository } from "../../repositories/inventory.repository";

interface DeleteMaterialUseCase {
  execute(id: number): Promise<boolean>;
}

export class DeleteMaterial implements DeleteMaterialUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: number): Promise<boolean> {
    const material = await this.inventoryRepository.getMaterialById(id, true);

    if (!material) throw new CustomError(404, "Material no encontrado");

    if (material.stockMoves && material.stockMoves.length > 0) {
      throw new CustomError(
        400,
        "No se puede eliminar el material porque tiene movimientos de stock asociados"
      );
    }

    return this.inventoryRepository.deleteMaterial(id);
  }
}
