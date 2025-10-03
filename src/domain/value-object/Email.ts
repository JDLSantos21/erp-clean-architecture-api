import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX =
    /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!Email.EMAIL_REGEX.test(value)) {
      throw CustomError.badRequest("El formato del email no es válido");
    }
  }

  /**
   * Crea un Value Object Email validado
   * @param email - Email a validar
   * @returns Email - Instancia validada
   * @throws CustomError si el email es inválido
   */
  public static create(email: string): Email {
    // Validación de presencia
    if (!ValueObject.isDefined(email)) {
      throw CustomError.badRequest("El email es requerido");
    }

    if (typeof email !== "string") {
      throw CustomError.badRequest("El email debe ser un texto");
    }

    // Normalización
    const normalized = email.toLowerCase().trim();

    if (normalized.length === 0) {
      throw CustomError.badRequest("El email no puede estar vacío");
    }

    return new Email(normalized);
  }

  /**
   * Valida si un string es un email válido sin crear la instancia
   * @param email - Email a validar
   * @returns true si es válido
   */
  public static isValid(email: string): boolean {
    if (!email || typeof email !== "string") return false;
    const normalized = email.toLowerCase().trim();
    return Email.EMAIL_REGEX.test(normalized);
  }

  /**
   * Compara dos emails por valor
   */
  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Obtiene el dominio del email
   * @returns Dominio del email (ej: "gmail.com")
   */
  public getDomain(): string {
    return this.value.split("@")[1];
  }

  /**
   * Obtiene el usuario del email
   * @returns Usuario del email (ej: "usuario")
   */
  public getLocalPart(): string {
    return this.value.split("@")[0];
  }
}
