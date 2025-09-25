import { CustomError } from "../../errors/custom.errors";
import { InventoryRepository } from "../../repositories/inventory.repository";

interface DeleteCategoryUseCase {
  execute(id: number): Promise<boolean>;
}

export class DeleteCategory implements DeleteCategoryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(id: number): Promise<boolean> {
    const category = await this.inventoryRepository.getMaterialCategoryById(id);

    if (!category) throw new CustomError(404, "Categoría no encontrada");

    const materials = await this.inventoryRepository.getMaterials(
      {
        categoryId: id,
      },
      10, //limit
      0 //offset
    );

    if (materials.total > 0) {
      throw new CustomError(
        400,
        "No se puede eliminar la categoría porque está asociada a materiales"
      );
    }

    return this.inventoryRepository.deleteMaterialCategory(id);
  }
}
