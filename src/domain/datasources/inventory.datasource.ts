import {
  CreateStockMoveDto,
  UpdateMaterialDto,
  CreateMaterialDto,
  CreateUnitDto,
  MaterialQueryDto,
} from "../dtos";
import { StockMoveQueryDto } from "../dtos/inventory/stock-move-query.dto";
import {
  Material,
  MaterialCategory,
  StockMove,
  Unit,
} from "../entities/Inventory";

export abstract class InventoryDatasource {
  abstract createMaterial(data: CreateMaterialDto): Promise<Material>;
  abstract getMaterials(
    filters: Omit<MaterialQueryDto, "page" | "limit">,
    limit: number,
    skip: number
  ): Promise<{ materials: Material[]; total: number }>;
  abstract getMaterialById(
    id: number,
    moves?: boolean
  ): Promise<Material | null>;
  abstract updateMaterial(
    id: number,
    data: UpdateMaterialDto
  ): Promise<Material>;
  abstract deleteMaterial(id: number): Promise<boolean>;
  abstract createStockMove(data: CreateStockMoveDto): Promise<StockMove | null>;
  abstract getStockMoves(
    filters: Omit<StockMoveQueryDto, "page" | "limit">,
    limit: number,
    skip: number
  ): Promise<{ stockMoves: StockMove[]; total: number }>;
  abstract getStockMoveById(id: number): Promise<StockMove | null>;
  abstract getMaterialByName(name: string): Promise<Material | null>;

  // Unit related methods
  abstract createUnit(data: CreateUnitDto): Promise<Unit>;
  abstract getUnitById(id: number): Promise<Unit | null>;
  abstract getUnitByName(name: string): Promise<Unit | null>;
  abstract getUnits(): Promise<Unit[]>;
  abstract deleteUnit(id: number): Promise<boolean>;

  // Categories related methods
  abstract createMaterialCategory(name: string): Promise<MaterialCategory>;
  abstract getMaterialCategoryById(
    id: number
  ): Promise<MaterialCategory | null>;
  abstract getMaterialCategoryByName(
    name: string
  ): Promise<MaterialCategory | null>;
  abstract getMaterialCategories(): Promise<MaterialCategory[]>;
  abstract deleteMaterialCategory(id: number): Promise<boolean>;
}
