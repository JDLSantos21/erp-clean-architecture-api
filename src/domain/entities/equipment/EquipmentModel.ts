import Entity from "../entity";

export enum EquipmentType {
  ANAQUEL = "ANAQUEL",
  NEVERA = "NEVERA",
  OTROS = "OTROS",
}

export class EquipmentModel extends Entity<EquipmentModel> {
  id!: number;
  name!: string;
  type!: EquipmentType;
  brand?: string;
  capacity?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public isRefrigerator(): boolean {
    return this.type === EquipmentType.NEVERA;
  }

  public isShelf(): boolean {
    return this.type === EquipmentType.ANAQUEL;
  }

  public isOther(): boolean {
    return this.type === EquipmentType.OTROS;
  }

  public hasBrand(): boolean {
    return !!this.brand && this.brand.trim().length > 0;
  }

  public hasCapacity(): boolean {
    return !!this.capacity && this.capacity > 0;
  }

  public getFullDescription(): string {
    let description = `${this.name} (${this.type})`;

    if (this.hasBrand()) {
      description += ` - ${this.brand}`;
    }

    if (this.hasCapacity()) {
      const unit = this.isRefrigerator()
        ? "L"
        : this.isShelf()
        ? "m³"
        : "unidades";
      description += ` - Capacidad: ${this.capacity} ${unit}`;
    }

    return description;
  }

  public isCompatibleWithType(requiredType: EquipmentType): boolean {
    return this.type === requiredType;
  }

  public meetsCapacityRequirement(minCapacity: number): boolean {
    if (!this.hasCapacity()) return false;
    return this.capacity! >= minCapacity;
  }
}
