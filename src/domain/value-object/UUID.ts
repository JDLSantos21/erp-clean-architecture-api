import { ValueObject } from "./ValueObject";
import { CustomError } from "../errors/custom.errors";

export class UUID extends ValueObject<string> {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!UUID.UUID_REGEX.test(value)) {
      throw CustomError.badRequest("El formato del ID no es válido");
    }
  }

  /**
   * Crea un Value Object UUID validado
   * @param uuid - UUID a validar
   * @returns UUID - Instancia validada
   * @throws CustomError si el UUID es inválido
   */
  public static create(uuid: string): UUID {
    // Validación de presencia
    if (!ValueObject.isDefined(uuid)) {
      throw CustomError.badRequest("El ID es requerido");
    }

    if (typeof uuid !== "string") {
      throw CustomError.badRequest("El ID debe ser un texto");
    }

    const trimmed = uuid.trim();

    if (trimmed.length === 0) {
      throw CustomError.badRequest("El ID no puede estar vacío");
    }

    // Normalización
    const normalized = trimmed.toLowerCase();

    return new UUID(normalized);
  }

  /**
   * Valida si un string es un UUID válido sin crear la instancia
   */
  public static isValid(uuid: string): boolean {
    if (!uuid || typeof uuid !== "string") return false;
    const normalized = uuid.trim().toLowerCase();
    return UUID.UUID_REGEX.test(normalized);
  }

  /**
   * Obtiene la versión del UUID (generalmente 4)
   */
  public getVersion(): number {
    return parseInt(this.value.charAt(14), 16);
  }

  /**
   * Obtiene la variante del UUID
   */
  public getVariant(): string {
    const variantChar = this.value.charAt(19);
    const variantValue = parseInt(variantChar, 16);

    if ((variantValue & 0x8) === 0x0) return "NCS";
    if ((variantValue & 0xc) === 0x8) return "RFC4122";
    if ((variantValue & 0xe) === 0xc) return "Microsoft";
    return "Reserved";
  }
}
