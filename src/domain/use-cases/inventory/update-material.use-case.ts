import { InventoryRepository } from "../../repositories/inventory.repository";
import { CustomError } from "../../errors/custom.errors";
import { UpdateMaterialDto } from "../../dtos";
import { Material } from "../../entities/Inventory";
import { StatusCode } from "../../constants";

interface UpdateMaterialUseCase {
  execute(id: number, updateMaterialDto: UpdateMaterialDto): Promise<Material>;
}

export class UpdateMaterial implements UpdateMaterialUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(
    id: number,
    updateMaterialDto: UpdateMaterialDto
  ): Promise<Material> {
    const material = await this.inventoryRepository.getMaterialById(id);

    if (!material) {
      throw new CustomError(StatusCode.NOT_FOUND, "Material no encontrado");
    }

    if (updateMaterialDto.name && updateMaterialDto.name !== material.name) {
      const materialNameExists =
        await this.inventoryRepository.getMaterialByName(
          updateMaterialDto.name
        );

      if (materialNameExists && materialNameExists.id !== id) {
        throw new CustomError(
          StatusCode.CONFLICT,
          "Ya existe un material con ese nombre"
        );
      }
    }

    if (
      updateMaterialDto.categoryId &&
      updateMaterialDto.categoryId !== material.categoryId
    ) {
      const materialCategory =
        await this.inventoryRepository.getMaterialCategoryById(
          updateMaterialDto.categoryId
        );

      if (!materialCategory) {
        throw new CustomError(
          StatusCode.NOT_FOUND,
          "Categoría de material no encontrada"
        );
      }
    }

    if (
      updateMaterialDto.unitId &&
      updateMaterialDto.unitId !== material.unitId
    ) {
      const materialUnit = await this.inventoryRepository.getUnitById(
        updateMaterialDto.unitId
      );
      if (!materialUnit) {
        throw new CustomError(
          StatusCode.NOT_FOUND,
          "Unidad de material no encontrada"
        );
      }
    }

    return this.inventoryRepository.updateMaterial(id, updateMaterialDto);
  }
}
