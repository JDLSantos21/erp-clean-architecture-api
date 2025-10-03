type Primitives = string | number | boolean | Date;

export abstract class ValueObject<T extends Primitives> {
  readonly value: T;

  protected constructor(value: T) {
    this.value = value;
  }

  protected static isDefined(value: any): boolean {
    return value !== null && value !== undefined;
  }

  public equals(other: ValueObject<T>): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public toString(): string {
    return String(this.value);
  }
}
