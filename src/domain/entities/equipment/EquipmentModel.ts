import { EQUIPMENT_TYPE } from "../../constants";
import { IntegerId } from "../../value-object";
import Entity from "../entity";

export type EquipmentType = "ANAQUEL" | "NEVERA" | "OTROS";

export class EquipmentModel extends Entity<EquipmentModel> {
  id!: IntegerId;
  name!: string;
  type!: EquipmentType;
  brand?: string | null;
  capacity?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public isRefrigerator(): boolean {
    return this.type === EQUIPMENT_TYPE.NEVERA;
  }

  public isShelf(): boolean {
    return this.type === EQUIPMENT_TYPE.ANAQUEL;
  }

  public isOther(): boolean {
    return this.type === EQUIPMENT_TYPE.OTROS;
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
