import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class Password extends ValueObject<string> {
  private static readonly MIN_LENGTH = 6;
  private static readonly MAX_LENGTH = 30;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (
      value.length < Password.MIN_LENGTH ||
      value.length > Password.MAX_LENGTH
    ) {
      throw CustomError.badRequest(
        `La contraseña debe tener entre ${Password.MIN_LENGTH} y ${Password.MAX_LENGTH} caracteres`
      );
    }
  }

  /**
   * Crea un Value Object Password validado
   * @param password - Contraseña a validar
   * @returns Password - Instancia validada
   * @throws CustomError si la contraseña es inválida
   */
  public static create(password: string): Password {
    // Validación de presencia
    if (!ValueObject.isDefined(password)) {
      throw CustomError.badRequest("La contraseña es requerida");
    }

    if (typeof password !== "string") {
      throw CustomError.badRequest("La contraseña debe ser un texto");
    }

    // NO hacer trim en contraseñas - los espacios pueden ser intencionales

    if (password.length === 0) {
      throw CustomError.badRequest("La contraseña no puede estar vacía");
    }

    return new Password(password);
  }

  /**
   * Valida si un string es una contraseña válida sin crear la instancia
   */
  public static isValid(password: string): boolean {
    if (!password || typeof password !== "string") return false;
    return (
      password.length >= Password.MIN_LENGTH &&
      password.length <= Password.MAX_LENGTH
    );
  }

  /**
   * Valida si la contraseña cumple con requisitos de seguridad adicionales
   * (Esta validación es opcional y puede activarse según necesidades)
   */
  public meetsSecurityRequirements(): {
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    isStrong: boolean;
  } {
    const hasUppercase = /[A-Z]/.test(this.value);
    const hasLowercase = /[a-z]/.test(this.value);
    const hasNumber = /\d/.test(this.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.value);

    return {
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      isStrong: hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
    };
  }

  /**
   * Obtiene la longitud de la contraseña
   */
  public getLength(): number {
    return this.value.length;
  }

  // NUNCA exponer el valor directamente en logs o respuestas
  public toString(): string {
    return "***HIDDEN***";
  }

  public toJSON(): string {
    return "***HIDDEN***";
  }
}
