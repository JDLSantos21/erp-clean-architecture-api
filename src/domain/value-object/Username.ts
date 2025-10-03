import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class Username extends ValueObject<string> {
  private static readonly MIN_LENGTH = 4;
  private static readonly MAX_LENGTH = 20;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (
      value.length < Username.MIN_LENGTH ||
      value.length > Username.MAX_LENGTH
    ) {
      throw CustomError.badRequest(
        `El nombre de usuario debe tener entre  y  caracteres`
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw CustomError.badRequest(
        "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos"
      );
    }
  }

  public static create(username: string): Username {
    if (!ValueObject.isDefined(username)) {
      throw CustomError.badRequest("El nombre de usuario es requerido");
    }

    if (typeof username !== "string") {
      throw CustomError.badRequest("El nombre de usuario debe ser un texto");
    }

    const trimmed = username.trim();

    if (trimmed.length === 0) {
      throw CustomError.badRequest("El nombre de usuario no puede estar vacío");
    }

    return new Username(trimmed.toLowerCase());
  }

  public static isValid(username: string): boolean {
    if (!username || typeof username !== "string") return false;
    const trimmed = username.trim();
    return (
      trimmed.length >= Username.MIN_LENGTH &&
      trimmed.length <= Username.MAX_LENGTH &&
      /^[a-zA-Z0-9_-]+$/.test(trimmed)
    );
  }

  public toUpperCase(): string {
    return this.value.toUpperCase();
  }
}
