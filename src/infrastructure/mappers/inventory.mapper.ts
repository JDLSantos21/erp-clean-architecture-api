import { Material, StockMove } from "../../domain";

export class InventoryMapper {
  static materialEntityFromObject(obj: any): Material {
    const { id, name, description, category, unit, stock, stockMoves } = obj;

    if (!id || !name || !category || !unit || stock === undefined) {
      throw new Error("Invalid material object");
    }

    let mappedStockMoves = undefined;
    if (stockMoves && Array.isArray(stockMoves)) {
      mappedStockMoves = stockMoves.map((move) =>
        InventoryMapper.stockMoveEntityFromObject(move, ["material"])
      );
    }

    return new Material({
      id,
      name,
      description,
      category: category.name,
      unit,
      stock,
      stockMoves: mappedStockMoves,
    });
  }

  static stockMoveEntityFromObject(
    obj: any,
    excludeFields: string[] = []
  ): StockMove {
    const {
      id,
      material,
      type,
      quantity,
      user,
      previousStock,
      newStock,
      date,
      description,
      createdAt,
      updatedAt,
    } = obj;

    if (
      !id ||
      !type ||
      !quantity ||
      !user ||
      !date ||
      previousStock === undefined ||
      newStock === undefined
    )
      throw new Error("Invalid stock move object");

    const stockMoveData: any = {
      id,
      type,
      quantity,
      user,
      previousStock,
      newStock,
      date,
      description,
      createdAt,
      updatedAt,
    };

    if (!excludeFields.includes("material") && material) {
      stockMoveData.material = material.name;
    }

    return new StockMove(stockMoveData);
  }
}
