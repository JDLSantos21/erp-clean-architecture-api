import { ValueObject } from "./ValueObject";

export class IntegerId extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
    this.validate(value);
  }

  private validate(value: number): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("El ID debe ser un entero positivo");
    }
  }

  public static create(id: number): IntegerId {
    if (!ValueObject.isDefined(id)) {
      throw new Error("El ID es requerido");
    }
    if (typeof id !== "number" || isNaN(id)) {
      throw new Error("El ID debe ser un número");
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("El ID debe ser un entero positivo");
    }
    return new IntegerId(id);
  }

  public static isValid(id: number): boolean {
    if (!ValueObject.isDefined(id)) return false;
    if (typeof id !== "number" || isNaN(id)) return false;
    return Number.isInteger(id) && id > 0;
  }
}
