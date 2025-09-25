import { start } from "repl";
import { Validators } from "../../../config";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../../constants";
import { StockMoveType } from "../../entities/Inventory";
import { CustomError } from "../../errors/custom.errors";
import e from "express";

export class StockMoveQueryDto {
  constructor(
    public limit: number,
    public page: number,
    public materialId?: number,
    public materialName?: string,
    public userId?: string,
    public startDate?: Date,
    public endDate?: Date,
    public type?: StockMoveType,
    public search?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, StockMoveQueryDto?] {
    const {
      page,
      limit,
      material_id,
      material_name,
      userId,
      start_date,
      end_date,
      search,
      type,
    } = object;

    const pageNum = Number(page) || DEFAULT_PAGE;
    const limitNum = Number(limit) || DEFAULT_LIMIT;

    const materialId = Number(material_id);

    if (userId && !Validators.uuid.test(userId))
      throw CustomError.badRequest("El ID de usuario no es válido");

    if (materialId && !Validators.isPositiveInteger(materialId))
      return ["El ID de material no es válido", undefined];

    if (!Validators.isPositiveInteger(pageNum))
      return ["El número de página debe ser un entero positivo", undefined];

    if (!Validators.isPositiveInteger(limitNum))
      return ["El límite debe ser un entero positivo", undefined];

    if (material_name && !Validators.isValidString(material_name))
      return ["El nombre de material no es válido", undefined];

    if (search && !Validators.isValidString(search))
      return ["El término de búsqueda no es válido", undefined];

    if (start_date && !Validators.isValidDate(start_date))
      return ["La fecha de inicio no es válida", undefined];

    if (end_date && !Validators.isValidDate(end_date))
      return ["La fecha de fin no es válida", undefined];

    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      if (start > end)
        return [
          "La fecha de inicio no puede ser posterior a la fecha de fin",
          undefined,
        ];
    }

    const stockMoves = ["SALIDA", "ENTRADA", "AJUSTE"];

    if (type && !stockMoves.includes(type))
      return ["El tipo de movimiento no es válido", undefined];

    return [
      undefined,
      new StockMoveQueryDto(
        limitNum,
        pageNum,
        materialId || undefined,
        material_name,
        userId || undefined,
        start_date,
        end_date,
        type,
        search
      ),
    ];
  }
}
