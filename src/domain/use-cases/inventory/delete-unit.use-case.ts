import { CustomError } from "../../errors/custom.errors";
import { InventoryRepository } from "../../repositories/inventory.repository";

interface DeleteUnitUseCase {
  execute(id: number): Promise<boolean>;
}

export class DeleteUnit implements DeleteUnitUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: number): Promise<boolean> {
    const unit = await this.inventoryRepository.getUnitById(id);

    if (!unit) throw new CustomError(404, "Unidad no encontrada");

    const materials = await this.inventoryRepository.getMaterials(
      {
        unitId: id,
      },
      10, //limit
      0 //offset
    );

    if (materials.total > 0) {
      throw new CustomError(
        400,
        "No se puede eliminar la unidad porque está asociada a materiales"
      );
    }

    return this.inventoryRepository.deleteUnit(id);
  }
}
