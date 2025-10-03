import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class PhoneNumber extends ValueObject<string> {
  private static readonly PHONE_REGEX = /^(1?(809|829|849)\d{7})$/i;
  private static readonly VALID_AREA_CODES = ["809", "829", "849"];

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!PhoneNumber.PHONE_REGEX.test(value)) {
      throw CustomError.badRequest(
        "El formato del número de teléfono no es válido. Debe ser (809|829|849) seguido de 7 dígitos"
      );
    }
  }

  /**
   * Crea un Value Object PhoneNumber validado
   * @param phone - Número de teléfono a validar
   * @returns PhoneNumber - Instancia validada
   * @throws CustomError si el teléfono es inválido
   */
  public static create(phone: string): PhoneNumber {
    // Validación de presencia
    if (!ValueObject.isDefined(phone)) {
      throw CustomError.badRequest("El número de teléfono es requerido");
    }

    if (typeof phone !== "string") {
      throw CustomError.badRequest("El número de teléfono debe ser un texto");
    }

    // Normalización: quitar espacios, guiones, paréntesis
    const normalized = phone.replace(/[\s\-()]/g, "");

    if (normalized.length === 0) {
      throw CustomError.badRequest(
        "El número de teléfono no puede estar vacío"
      );
    }

    return new PhoneNumber(normalized);
  }

  /**
   * Valida si un string es un teléfono válido sin crear la instancia
   */
  public static isValid(phone: string): boolean {
    if (!phone || typeof phone !== "string") return false;
    const normalized = phone.replace(/[\s\-()]/g, "");
    return PhoneNumber.PHONE_REGEX.test(normalized);
  }

  /**
   * Obtiene el código de área (809, 829, 849)
   */
  public getAreaCode(): string {
    const match = this.value.match(/^1?(809|829|849)/);
    return match ? match[1] : "";
  }

  /**
   * Obtiene el número formateado: (809) 123-4567
   */
  public getFormatted(): string {
    const cleaned = this.value.replace(/^1/, ""); // Quitar 1 inicial si existe
    const areaCode = cleaned.substring(0, 3);
    const firstPart = cleaned.substring(3, 6);
    const secondPart = cleaned.substring(6);

    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }

  /**
   * Obtiene el número sin formato
   */
  public getRaw(): string {
    return this.value.replace(/^1/, ""); // Sin el 1 inicial
  }
}
