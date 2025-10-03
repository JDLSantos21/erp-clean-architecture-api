import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class RNC extends ValueObject<string> {
  private static readonly RNC_REGEX = /^\d{9}$/;
  private static readonly RNC_LENGTH = 9;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!RNC.RNC_REGEX.test(value)) {
      throw CustomError.badRequest(
        "El formato del RNC no es válido. Debe contener exactamente 9 dígitos"
      );
    }
  }

  /**
   * Crea un Value Object RNC validado
   * @param rnc - RNC a validar
   * @returns RNC - Instancia validada
   * @throws CustomError si el RNC es inválido
   */
  public static create(rnc: string): RNC {
    // Validación de presencia
    if (!ValueObject.isDefined(rnc)) {
      throw CustomError.badRequest("El RNC es requerido");
    }

    if (typeof rnc !== "string") {
      throw CustomError.badRequest("El RNC debe ser un texto");
    }

    // Normalización: quitar espacios y guiones
    const normalized = rnc.replace(/[\s\-]/g, "");

    if (normalized.length === 0) {
      throw CustomError.badRequest("El RNC no puede estar vacío");
    }

    return new RNC(normalized);
  }

  /**
   * Valida si un string es un RNC válido sin crear la instancia
   */
  public static isValid(rnc: string): boolean {
    if (!rnc || typeof rnc !== "string") return false;
    const normalized = rnc.replace(/[\s\-]/g, "");
    return RNC.RNC_REGEX.test(normalized);
  }

  /**
   * Obtiene el RNC formateado: XXX-XXXXX-X
   */
  public getFormatted(): string {
    return `${this.value.substring(0, 3)}-${this.value.substring(
      3,
      8
    )}-${this.value.substring(8)}`;
  }

  /**
   * Obtiene el RNC sin formato (solo números)
   */
  public getRaw(): string {
    return this.value;
  }
}
