import {
  CreateMaterialDto,
  CreateStockMoveDto,
  CreateUnitDto,
  CustomError,
  InventoryDatasource,
  Material,
  MaterialCategory,
  StockMove,
  StockMoveQueryDto,
  Unit,
  UpdateMaterialDto,
  MaterialQueryDto,
  StatusCode,
  FilterParams,
} from "../../domain";
import { buildWhere, InventoryMapper } from "../mappers";
import { PrismaClient } from "@prisma/client";

export class InventoryDatasourceImpl extends InventoryDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async createMaterial(data: CreateMaterialDto): Promise<Material> {
    try {
      const createdMaterial = await this.prisma.material.create({
        data,
        include: {
          category: { select: { name: true } },
          unit: { select: { name: true } },
        },
      });

      return InventoryMapper.materialEntityFromObject(createdMaterial);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error creating material"
      );
    }
  }

  async updateMaterial(id: number, data: UpdateMaterialDto): Promise<Material> {
    try {
      const updatedMaterial = await this.prisma.material.update({
        where: { id },
        data,
        include: {
          category: { select: { name: true } },
          unit: { select: { name: true, symbol: true } },
        },
      });
      return InventoryMapper.materialEntityFromObject(updatedMaterial);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error updating material"
      );
    }
  }

  createMaterialCategory(name: string): Promise<MaterialCategory> {
    try {
      const createdCategory = this.prisma.materialCategories.create({
        data: { name },
      });

      return createdCategory;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error creating material category"
      );
    }
  }

  async createStockMove(data: CreateStockMoveDto): Promise<StockMove> {
    try {
      const createdStockMove = await this.prisma.$transaction(
        async (prisma) => {
          const stockMove = await this.prisma.stockMove.create({
            data: {
              ...data,
              previousStock: data.previousStock!,
              newStock: data.newStock!,
            },
            include: {
              material: { select: { id: true, name: true } },
              user: { select: { id: true, name: true } },
            },
          });

          await this.prisma.material.update({
            where: { id: data.materialId },
            data: { stock: data.newStock! },
          });

          return stockMove;
        }
      );

      return InventoryMapper.stockMoveEntityFromObject(createdStockMove);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error creating stock move"
      );
    }
  }

  async createUnit(data: CreateUnitDto): Promise<Unit> {
    try {
      const createdUnit = await this.prisma.unit.create({ data });
      return new Unit(createdUnit);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(StatusCode.INTERNAL_ERROR, "error creating unit");
    }
  }

  async deleteMaterial(id: number): Promise<boolean> {
    try {
      const materialStockMoves = await this.prisma.stockMove.findFirst({
        where: { materialId: id },
      });

      if (materialStockMoves) {
        throw new CustomError(
          400,
          "No se puede eliminar el material porque tiene movimientos de stock asociados"
        );
      }

      const material = await this.prisma.material.delete({ where: { id } });

      return !!material;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "Ocurrió un error inesperado, el material no pudo ser eliminado"
      );
    }
  }

  async deleteMaterialCategory(id: number): Promise<boolean> {
    try {
      const category = await this.prisma.materialCategories.delete({
        where: { id },
      });

      return !!category;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "Ocurrió un error inesperado, la categoría no pudo ser eliminada"
      );
    }
  }

  async deleteUnit(id: number): Promise<boolean> {
    try {
      const unit = await this.prisma.unit.delete({ where: { id } });
      return !!unit;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "Ocurrió un error inesperado, la unidad no pudo ser eliminada"
      );
    }
  }

  async getMaterialById(
    id: number,
    moves: boolean = false
  ): Promise<Material | null> {
    try {
      const material = await this.prisma.material.findUnique({
        where: { id },
        include: {
          category: { select: { name: true } },
          unit: { select: { name: true } },
          stockMoves: moves
            ? {
                include: {
                  user: { select: { id: true, name: true } },
                },
              }
            : false,
        },
      });
      return material
        ? InventoryMapper.materialEntityFromObject(material)
        : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching material by id"
      );
    }
  }

  async getMaterialByName(name: string): Promise<Material | null> {
    try {
      const material = await this.prisma.material.findUnique({
        where: { name },
        include: {
          category: { select: { name: true } },
          unit: { select: { name: true } },
        },
      });

      return material
        ? InventoryMapper.materialEntityFromObject(material)
        : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching material by name"
      );
    }
  }

  async getMaterialCategories(): Promise<MaterialCategory[]> {
    try {
      const categories = await this.prisma.materialCategories.findMany();
      return categories.map((category) => new MaterialCategory(category));
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching material categories"
      );
    }
  }

  async getMaterialCategoryById(id: number): Promise<MaterialCategory | null> {
    try {
      const category = await this.prisma.materialCategories.findUnique({
        where: { id },
      });
      return category ? new MaterialCategory(category) : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching material category"
      );
    }
  }

  async getMaterialCategoryByName(
    name: string
  ): Promise<MaterialCategory | null> {
    try {
      const category = await this.prisma.materialCategories.findUnique({
        where: { name },
      });
      return category ? new MaterialCategory(category) : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching material category"
      );
    }
  }

  async getMaterials(
    filterParams: FilterParams<MaterialQueryDto>
  ): Promise<{ materials: Material[]; total: number }> {
    const { filters, limit, skip } = filterParams;
    const { stockLessThan, stockGreaterThan, ...DbFieldsFilters } = filters;
    const where = buildWhere(DbFieldsFilters, ["name"]);

    if (stockLessThan !== undefined)
      where.stock = { ...where.stock, lt: stockLessThan };

    if (stockGreaterThan !== undefined)
      where.stock = { ...where.stock, gt: stockGreaterThan };

    try {
      const [materials, total] = await Promise.all([
        this.prisma.material.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: { select: { name: true } },
            unit: { select: { name: true } },
          },
        }),
        this.prisma.material.count({ where }),
      ]);

      const mappedMaterials = materials.map((material) =>
        InventoryMapper.materialEntityFromObject(material)
      );

      return { materials: mappedMaterials, total };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching materials"
      );
    }
  }

  async getStockMoves(
    filterParams: FilterParams<StockMoveQueryDto>
  ): Promise<{ stockMoves: StockMove[]; total: number }> {
    const { filters, limit, skip } = filterParams;
    const { materialName, ...DbFieldsFilters } = filters;
    const where = buildWhere(DbFieldsFilters, ["type", "description"], "date");

    if (materialName) {
      where.material = {
        name: { contains: materialName, mode: "insensitive" },
      };
    }

    try {
      const [stockMoves, total] = await Promise.all([
        this.prisma.stockMove.findMany({
          where,
          skip,
          take: limit,
          include: {
            material: { select: { id: true, name: true } },
            user: { select: { id: true, name: true } },
          },
          orderBy: { date: "desc" },
        }),
        this.prisma.stockMove.count({ where }),
      ]);

      const mappedStockMoves = stockMoves.map((move) =>
        InventoryMapper.stockMoveEntityFromObject(move)
      );
      return { stockMoves: mappedStockMoves, total };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching stock moves"
      );
    }
  }

  async getStockMoveById(id: number): Promise<StockMove | null> {
    try {
      const stockMove = await this.prisma.stockMove.findUnique({
        where: {
          id,
        },
        include: {
          material: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      });
      return stockMove
        ? InventoryMapper.stockMoveEntityFromObject(stockMove)
        : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        StatusCode.INTERNAL_ERROR,
        "error fetching stock move"
      );
    }
  }

  async getUnitById(id: number): Promise<Unit | null> {
    try {
      const unit = await this.prisma.unit.findUnique({ where: { id } });
      return unit ? new Unit(unit) : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(StatusCode.INTERNAL_ERROR, "error fetching unit");
    }
  }

  async getUnitByName(name: string): Promise<Unit | null> {
    try {
      const unit = await this.prisma.unit.findUnique({ where: { name } });
      return unit ? new Unit(unit) : null;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(StatusCode.INTERNAL_ERROR, "error fetching unit");
    }
  }

  async getUnits(): Promise<Unit[]> {
    try {
      const units = await this.prisma.unit.findMany();
      return units.map((unit) => new Unit(unit));
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(StatusCode.INTERNAL_ERROR, "error fetching units");
    }
  }
}
