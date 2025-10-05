import { ValueObject } from "./ValueObject";

/**
 * Value Object que representa una fecha futura o actual.
 * Se utiliza para fechas de programación (scheduled dates) que no pueden estar en el pasado.
 *
 * Casos de uso:
 * - Fecha programada de entrega (Order.scheduledDate)
 * - Fecha programada de mantenimiento (Maintenance.scheduledDate)
 * - Cualquier fecha de planificación futura
 */
export class FutureDate extends ValueObject<Date> {
  private constructor(value: Date) {
    super(value);
    this.validate(value);
  }

  private validate(value: Date): void {
    // Validar que es una fecha válida
    if (isNaN(value.getTime())) {
      throw new Error("La fecha no es válida");
    }

    // Validar que no está en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (value < today) {
      throw new Error("La fecha no puede estar en el pasado");
    }
  }

  /**
   * Crea un Value Object FutureDate validado
   * @param date - Fecha a validar (Date, string ISO, timestamp)
   * @returns FutureDate - Instancia validada
   * @throws CustomError si la fecha es inválida o está en el pasado
   */
  public static create(date: Date | string | number): FutureDate {
    if (!ValueObject.isDefined(date)) {
      throw new Error("La fecha es requerida");
    }

    // Convertir a Date si es string o number
    const parsedDate = date instanceof Date ? date : new Date(date);

    return new FutureDate(parsedDate);
  }

  /**
   * Valida si una fecha es válida y futura sin crear la instancia
   */
  public static isValid(date: Date | string | number): boolean {
    try {
      FutureDate.create(date);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crea una FutureDate para hoy
   */
  public static today(): FutureDate {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new FutureDate(today);
  }

  /**
   * Crea una FutureDate para una cantidad de días en el futuro
   * @param days - Número de días a partir de hoy
   */
  public static fromNow(days: number): FutureDate {
    if (!Number.isInteger(days) || days < 0) {
      throw new Error("Los días deben ser un número entero positivo");
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    futureDate.setHours(0, 0, 0, 0);

    return new FutureDate(futureDate);
  }

  /**
   * Retorna cuántos días faltan hasta esta fecha
   */
  public getDaysUntil(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = this.value.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si la fecha es hoy
   */
  public isToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.value.getTime() === today.getTime();
  }

  /**
   * Verifica si la fecha está en esta semana
   */
  public isThisWeek(): boolean {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);

    return this.value <= weekFromNow;
  }

  /**
   * Verifica si la fecha está en este mes
   */
  public isThisMonth(): boolean {
    const today = new Date();
    return (
      this.value.getMonth() === today.getMonth() &&
      this.value.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Retorna el año de la fecha
   */
  public getYear(): number {
    return this.value.getFullYear();
  }

  /**
   * Retorna el mes de la fecha (1-12)
   */
  public getMonth(): number {
    return this.value.getMonth() + 1;
  }

  /**
   * Retorna el día del mes
   */
  public getDay(): number {
    return this.value.getDate();
  }

  /**
   * Retorna la fecha formateada (YYYY-MM-DD)
   */
  public format(): string {
    const year = this.value.getFullYear();
    const month = String(this.value.getMonth() + 1).padStart(2, "0");
    const day = String(this.value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Retorna la fecha formateada local
   */
  public toLocaleDateString(locale: string = "es-DO"): string {
    return this.value.toLocaleDateString(locale);
  }

  /**
   * Retorna el objeto Date nativo (para interoperabilidad)
   */
  public toDate(): Date {
    return new Date(this.value);
  }

  /**
   * Retorna la fecha en formato ISO
   */
  public toISOString(): string {
    return this.value.toISOString();
  }
}
