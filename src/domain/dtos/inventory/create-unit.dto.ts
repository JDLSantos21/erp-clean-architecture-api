export class CreateUnitDto {
  constructor(public name: string, public symbol?: string) {}

  static create(object: { [key: string]: any }): [string?, CreateUnitDto?] {
    const { name, symbol } = object;

    if (!name) return ["El nombre es obligatorio", undefined];

    if (typeof name !== "string" || name.trim() === "")
      return ["El nombre debe ser una cadena no vacía", undefined];

    if (symbol) {
      if (typeof symbol !== "string" || symbol.trim() === "")
        return ["El símbolo debe ser una cadena no vacía", undefined];

      if (symbol.length > 6)
        return ["El símbolo no puede tener más de 6 caracteres", undefined];
    }

    return [undefined, new CreateUnitDto(name, symbol)];
  }
}
