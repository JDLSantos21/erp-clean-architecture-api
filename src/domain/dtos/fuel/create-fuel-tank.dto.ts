export class CreateFuelTankDto {
  constructor(
    public currentLevel: number,
    public capacity: number,
    public minLevel: number
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateFuelTankDto?] {
    const { current_level, capacity, min_level } = object;

    if (!capacity || !current_level || !min_level) {
      return ["Faltan campos requeridos", undefined];
    }

    if (typeof capacity !== "number" || capacity <= 0) {
      return ["La capacidad debe ser un número positivo", undefined];
    }

    if (typeof current_level !== "number" || current_level < 0) {
      return ["El nivel actual debe ser un número no negativo", undefined];
    }

    if (typeof min_level !== "number" || min_level < 0) {
      return ["El nivel mínimo debe ser un número no negativo", undefined];
    }

    if (current_level > capacity) {
      return ["El nivel actual no puede ser mayor que la capacidad", undefined];
    }

    if (min_level > capacity) {
      return ["El nivel mínimo no puede ser mayor que la capacidad", undefined];
    }

    return [
      undefined,
      new CreateFuelTankDto(current_level, capacity, min_level),
    ];
  }
}
