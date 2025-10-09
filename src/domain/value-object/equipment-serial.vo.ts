import { CustomError } from "../errors";

export class EquipmentSerialNumber {
  private static readonly SERIAL_REGEX = /^(ANQ|NEV|EQP)-\d{4}-\d{4}$/;

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim() === "") {
      throw CustomError.badRequest("El número de serie es requerido");
    }

    if (!EquipmentSerialNumber.SERIAL_REGEX.test(value)) {
      throw CustomError.badRequest("Formato de número de serie inválido");
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
