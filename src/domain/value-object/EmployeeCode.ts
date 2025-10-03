import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class EmployeeCode extends ValueObject<string> {
  private static readonly CODE_REGEX = /^\d{1,4}$/;
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 4;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!EmployeeCode.CODE_REGEX.test(value)) {
      throw CustomError.badRequest(
        `El código de empleado debe tener entre ${EmployeeCode.MIN_LENGTH} y ${EmployeeCode.MAX_LENGTH} dígitos`
      );
    }
  }

  /**
   * Crea un Value Object EmployeeCode validado
   * @param code - Código de empleado a validar
   * @returns EmployeeCode - Instancia validada
   * @throws CustomError si el código es inválido
   */
  public static create(code: string): EmployeeCode {
    // Validación de presencia
    if (!ValueObject.isDefined(code)) {
      throw CustomError.badRequest("El código de empleado es requerido");
    }

    if (typeof code !== "string") {
      throw CustomError.badRequest("El código de empleado debe ser un texto");
    }

    const trimmed = code.trim();

    if (trimmed.length === 0) {
      throw CustomError.badRequest(
        "El código de empleado no puede estar vacío"
      );
    }

    return new EmployeeCode(trimmed);
  }

  /**
   * Valida si un string es un código de empleado válido sin crear la instancia
   */
  public static isValid(code: string): boolean {
    if (!code || typeof code !== "string") return false;
    return EmployeeCode.CODE_REGEX.test(code.trim());
  }

  /**
   * Obtiene el código con padding de ceros (ej: "1" -> "0001")
   */
  public getPadded(length: number = EmployeeCode.MAX_LENGTH): string {
    return this.value.padStart(length, "0");
  }

  /**
   * Convierte el código a número
   */
  public toNumber(): number {
    return parseInt(this.value, 10);
  }
}
