import { DEFAULT_LIMIT, DEFAULT_PAGE } from "../../constants";

export class MaterialQueryDto {
  constructor(
    public limit: number,
    public page: number,
    public id?: number,
    public name?: string,
    public categoryId?: number,
    public unitId?: number,
    public stockLessThan?: number,
    public stockGreaterThan?: number,
    public search?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, MaterialQueryDto?] {
    const {
      page,
      limit,
      id,
      name,
      category_id,
      unit_id,
      stock_less_than,
      stock_greater_than,
      search,
    } = object;

    const pageNum = Number(page) || DEFAULT_PAGE;
    const limitNum = Number(limit) || DEFAULT_LIMIT;

    const idNum = Number(id);
    const categoryIdNum = Number(category_id);
    const unitIdNum = Number(unit_id);
    const stockLessThanNum = Number(stock_less_than);
    const stockGreaterThanNum = Number(stock_greater_than);

    if (id !== undefined && (isNaN(idNum) || idNum <= 0))
      return ["El ID no es válido", undefined];

    if (name !== undefined && (typeof name !== "string" || name.trim() === ""))
      return ["El nombre debe ser una cadena no vacía", undefined];

    if (
      category_id !== undefined &&
      (isNaN(categoryIdNum) || categoryIdNum <= 0)
    )
      return ["El ID de la categoría no es válido", undefined];

    if (unit_id !== undefined && (isNaN(unitIdNum) || unitIdNum <= 0))
      return ["El ID de la unidad no es válido", undefined];

    if (
      stock_less_than !== undefined &&
      (isNaN(stockLessThanNum) || stockLessThanNum < 0)
    )
      return ["El stock menor que debe ser un número no negativo", undefined];

    if (
      stock_greater_than !== undefined &&
      (isNaN(stockGreaterThanNum) || stockGreaterThanNum < 0)
    )
      return ["El stock mayor que debe ser un número no negativo", undefined];

    if (isNaN(pageNum) || pageNum < 1) {
      return ["Número de página inválido", undefined];
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return ["Número de límite inválido", undefined];
    }

    if (
      search !== undefined &&
      (typeof search !== "string" || search.trim() === "")
    )
      return ["El término de búsqueda debe ser una cadena no vacía", undefined];

    return [
      undefined,
      new MaterialQueryDto(
        limitNum,
        pageNum,
        idNum || undefined,
        name,
        categoryIdNum || undefined,
        unitIdNum || undefined,
        stockLessThanNum || undefined,
        stockGreaterThanNum || undefined,
        search
      ),
    ];
  }
}
