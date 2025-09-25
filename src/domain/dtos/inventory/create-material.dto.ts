export class CreateMaterialDto {
  constructor(
    public name: string,
    public categoryId: number,
    public unitId: number,
    public stock: number,
    public minimumStock: number,
    public description?: string
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateMaterialDto?] {
    const { name, category_id, unit_id, stock, minimum_stock, description } =
      object;

    const categoryIdNum = Number(category_id);
    const unitIdNum = Number(unit_id);
    const stockNum = Number(stock);
    const minimumStockNum = Number(minimum_stock);

    console.log(name, category_id, unit_id, stock, minimum_stock);
    if (
      !name ||
      !category_id ||
      !unit_id ||
      stock === undefined ||
      minimum_stock === undefined
    )
      return ["Todos los campos son obligatorios", undefined];

    if (typeof name !== "string" || name.trim() === "")
      return ["El nombre debe ser una cadena no vacía", undefined];

    if (isNaN(categoryIdNum) || categoryIdNum <= 0)
      return ["El ID de la categoría no es válido", undefined];

    if (isNaN(unitIdNum) || unitIdNum <= 0)
      return ["El ID de la unidad no es válido", undefined];

    if (isNaN(stockNum) || stockNum < 0)
      return ["El stock debe ser un número no negativo", undefined];

    if (isNaN(minimumStockNum) || minimumStockNum <= 0)
      return ["El stock mínimo debe ser un número positivo", undefined];

    return [
      undefined,
      new CreateMaterialDto(
        name,
        categoryIdNum,
        unitIdNum,
        stockNum,
        minimumStockNum,
        description
      ),
    ];
  }
}
