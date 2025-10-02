import { InventoryRepository } from "../../repositories";
import { CustomError } from "../../errors";
import { CreateMaterialDto } from "../../dtos";
import { Material } from "../../entities";
import { StatusCode } from "../../constants";

interface CreateMaterialUseCase {
  execute(createMaterialDto: CreateMaterialDto): Promise<Material>;
}

export class CreateMaterial implements CreateMaterialUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const [materialExists, materialCategory, materialUnit] = await Promise.all([
      this.inventoryRepository.getMaterialByName(createMaterialDto.name),
      this.inventoryRepository.getMaterialCategoryById(
        createMaterialDto.categoryId
      ),
      this.inventoryRepository.getUnitById(createMaterialDto.unitId),
    ]);

    if (materialExists) {
      throw new CustomError(
        StatusCode.CONFLICT,
        "Ya existe un material con ese nombre"
      );
    }

    if (!materialCategory)
      throw new CustomError(
        StatusCode.BAD_REQUEST,
        "Esta categoría de material no existe"
      );

    if (!materialUnit)
      throw new CustomError(
        StatusCode.BAD_REQUEST,
        "Esta unidad de medida no existe"
      );

    return this.inventoryRepository.createMaterial(createMaterialDto);
  }
}
