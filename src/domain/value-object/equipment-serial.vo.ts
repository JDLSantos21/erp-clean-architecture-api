import { ValueObject } from "./ValueObject";

export class EquipmentSerialNumber extends ValueObject<string> {
  private static readonly SERIAL_REGEX = /^(ANQ|NEV|EQP)-\d{4}-\d{4}$/;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === "") {
      throw new Error("El número de serie es requerido");
    }

    if (!EquipmentSerialNumber.SERIAL_REGEX.test(value)) {
      throw new Error("Formato de número de serie inválido");
    }
  }

  static create(value: string): EquipmentSerialNumber {
    return new EquipmentSerialNumber(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EquipmentSerialNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
