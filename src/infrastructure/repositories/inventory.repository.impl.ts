import {
  CreateMaterialDto,
  CreateStockMoveDto,
  CreateUnitDto,
  InventoryDatasource,
  InventoryRepository,
  Material,
  MaterialCategory,
  StockMove,
  StockMoveQueryDto,
  Unit,
  UpdateMaterialDto,
  MaterialQueryDto,
} from "../../domain";

export class InventoryRepositoryImpl implements InventoryRepository {
  constructor(private readonly InventoryDatasource: InventoryDatasource) {}

  createMaterial(data: CreateMaterialDto): Promise<Material> {
    return this.InventoryDatasource.createMaterial(data);
  }

  createMaterialCategory(name: string): Promise<MaterialCategory> {
    return this.InventoryDatasource.createMaterialCategory(name);
  }

  createStockMove(data: CreateStockMoveDto): Promise<StockMove | null> {
    return this.InventoryDatasource.createStockMove(data);
  }

  createUnit(data: CreateUnitDto): Promise<Unit> {
    return this.InventoryDatasource.createUnit(data);
  }

  deleteMaterial(id: number): Promise<boolean> {
    return this.InventoryDatasource.deleteMaterial(id);
  }

  deleteMaterialCategory(id: number): Promise<boolean> {
    return this.InventoryDatasource.deleteMaterialCategory(id);
  }

  deleteUnit(id: number): Promise<boolean> {
    return this.InventoryDatasource.deleteUnit(id);
  }

  getMaterialById(id: number, moves?: boolean): Promise<Material | null> {
    return this.InventoryDatasource.getMaterialById(id, moves);
  }

  getMaterialByName(name: string): Promise<Material | null> {
    return this.InventoryDatasource.getMaterialByName(name);
  }

  getMaterialCategories(): Promise<MaterialCategory[]> {
    return this.InventoryDatasource.getMaterialCategories();
  }

  getMaterialCategoryById(id: number): Promise<MaterialCategory | null> {
    return this.InventoryDatasource.getMaterialCategoryById(id);
  }

  getMaterialCategoryByName(name: string): Promise<MaterialCategory | null> {
    return this.InventoryDatasource.getMaterialCategoryByName(name);
  }

  getMaterials(
    filters: Omit<MaterialQueryDto, "page" | "limit">,
    limit: number,
    skip: number
  ): Promise<{ materials: Material[]; total: number }> {
    return this.InventoryDatasource.getMaterials(filters, limit, skip);
  }

  getStockMoves(
    filters: Omit<StockMoveQueryDto, "page" | "limit">,
    limit: number,
    skip: number
  ): Promise<{ stockMoves: StockMove[]; total: number }> {
    return this.InventoryDatasource.getStockMoves(filters, limit, skip);
  }

  getStockMoveById(id: number): Promise<StockMove | null> {
    return this.InventoryDatasource.getStockMoveById(id);
  }

  getUnitById(id: number): Promise<Unit | null> {
    return this.InventoryDatasource.getUnitById(id);
  }

  getUnitByName(name: string): Promise<Unit | null> {
    return this.InventoryDatasource.getUnitByName(name);
  }

  getUnits(): Promise<Unit[]> {
    return this.InventoryDatasource.getUnits();
  }

  updateMaterial(id: number, data: UpdateMaterialDto): Promise<Material> {
    return this.InventoryDatasource.updateMaterial(id, data);
  }
}
