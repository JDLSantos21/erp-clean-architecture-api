import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class Cedula extends ValueObject<string> {
  private static readonly CEDULA_REGEX = /^\d{3}-?\d{7}-?\d{1}$/;
  private static readonly CEDULA_LENGTH = 11;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    // Validación de longitud
    if (value.length !== Cedula.CEDULA_LENGTH) {
      throw CustomError.badRequest("La cédula debe tener 11 dígitos");
    }

    // Validación: solo números
    if (!/^\d+$/.test(value)) {
      throw CustomError.badRequest("La cédula debe contener solo números");
    }
  }

  /**
   * Crea un Value Object Cedula validado
   * @param cedula - Cédula a validar (con o sin guiones)
   * @returns Cedula - Instancia validada
   * @throws CustomError si la cédula es inválida
   */
  public static create(cedula: string): Cedula {
    // Validación de presencia
    if (!ValueObject.isDefined(cedula)) {
      throw CustomError.badRequest("La cédula es requerida");
    }

    if (typeof cedula !== "string") {
      throw CustomError.badRequest("La cédula debe ser un texto");
    }

    const trimmed = cedula.trim();

    if (trimmed.length === 0) {
      throw CustomError.badRequest("La cédula no puede estar vacía");
    }

    // Validación de formato
    if (!Cedula.CEDULA_REGEX.test(trimmed)) {
      throw CustomError.badRequest(
        "El formato de la cédula no es válido. Debe ser XXX-XXXXXXX-X o XXXXXXXXXXX"
      );
    }

    // Normalización: quitar guiones para almacenar
    const normalized = trimmed.replace(/-/g, "");

    return new Cedula(normalized);
  }

  /**
   * Valida si un string es una cédula válida sin crear la instancia
   */
  public static isValid(cedula: string): boolean {
    if (!cedula || typeof cedula !== "string") return false;
    return Cedula.CEDULA_REGEX.test(cedula.trim());
  }

  /**
   * Obtiene la cédula formateada: XXX-XXXXXXX-X
   */
  public getFormatted(): string {
    return `${this.value.substring(0, 3)}-${this.value.substring(
      3,
      10
    )}-${this.value.substring(10)}`;
  }

  /**
   * Obtiene la cédula sin formato (solo números)
   */
  public getRaw(): string {
    return this.value;
  }

  /**
   * Obtiene los primeros 3 dígitos (identificador regional)
   */
  public getRegionalCode(): string {
    return this.value.substring(0, 3);
  }
}
