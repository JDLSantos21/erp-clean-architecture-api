import { ValueObject } from "./ValueObject";

export class TrackingCode extends ValueObject<string> {
  private static readonly PREFIX = "PD";
  private static readonly PATTERN = /^PD-\d{6}-\d{4}-\d{2}$/;

  private constructor(value: string) {
    super(value);
    this.validate(value);
  }

  private validate(value: string): void {
    if (!TrackingCode.PATTERN.test(value)) {
      throw new Error(
        "El formato del código de seguimiento no es válido. Debe ser PD-XXXXXX-YYYY-CC"
      );
    }

    // Validar checksum
    const parts = value.split("-");
    const randomNumber = parts[1];
    const year = parts[2];
    const providedChecksum = parts[3];

    const calculatedChecksum = this.calculateChecksum(randomNumber, year);

    if (providedChecksum !== calculatedChecksum) {
      throw new Error("El checksum del código de seguimiento no es válido");
    }
  }

  /**
   * Calcula el checksum basado en el número aleatorio y el año
   * Suma todos los dígitos y toma los últimos 2 dígitos del resultado
   */
  private calculateChecksum(randomNumber: string, year: string): string {
    const combined = randomNumber + year;
    const sum = combined
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    // Tomar los últimos 2 dígitos del resultado
    const checksum = sum % 100;
    return checksum.toString().padStart(2, "0");
  }

  /**
   * Genera un nuevo código de seguimiento único
   * @param year - Año (opcional, por defecto el año actual)
   * @returns TrackingCode - Nueva instancia con código generado
   */
  public static generate(year?: number): TrackingCode {
    const currentYear = year || new Date().getFullYear();

    // Generar 6 dígitos aleatorios
    const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

    // Calcular checksum
    const instance = new TrackingCode("PD-000000-0000-00"); // temporal para acceder al método
    const checksum = instance.calculateChecksum(
      randomNumber,
      currentYear.toString()
    );

    // Construir el código completo
    const trackingCode = `${TrackingCode.PREFIX}-${randomNumber}-${currentYear}-${checksum}`;

    return new TrackingCode(trackingCode);
  }

  /**
   * Crea un Value Object TrackingCode validado
   * @param code - Código de seguimiento a validar
   * @returns TrackingCode - Instancia validada
   * @throws CustomError si el código es inválido
   */
  public static create(code: string): TrackingCode {
    if (!ValueObject.isDefined(code)) {
      throw new Error("El código de seguimiento es requerido");
    }

    if (typeof code !== "string") {
      throw new Error("El código de seguimiento debe ser un texto");
    }

    const trimmed = code.trim().toUpperCase();

    if (trimmed.length === 0) {
      throw new Error("El código de seguimiento no puede estar vacío");
    }

    return new TrackingCode(trimmed);
  }

  /**
   * Valida si un string es un código de seguimiento válido sin crear la instancia
   */
  public static isValid(code: string): boolean {
    try {
      TrackingCode.create(code);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrae el año del código de seguimiento
   */
  public getYear(): number {
    const parts = this.value.split("-");
    return parseInt(parts[2], 10);
  }

  /**
   * Extrae el número aleatorio del código de seguimiento
   */
  public getRandomNumber(): string {
    const parts = this.value.split("-");
    return parts[1];
  }

  /**
   * Extrae el checksum del código de seguimiento
   */
  public getChecksum(): string {
    const parts = this.value.split("-");
    return parts[3];
  }

  /**
   * Verifica si el código pertenece al año actual
   */
  public isCurrentYear(): boolean {
    return this.getYear() === new Date().getFullYear();
  }

  /**
   * Retorna una representación formateada del código
   */
  public format(): string {
    return this.value;
  }
}
