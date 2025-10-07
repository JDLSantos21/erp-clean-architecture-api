import { IntegerId } from "../../value-object";
import Entity from "../entity";

export class Product extends Entity<Product> {
  id!: IntegerId;
  name!: string;
  description?: string | null;
  unit!: string;
  size?: string | null;
  sku?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public isActiveProduct(): boolean {
    return this.isActive;
  }

  public hasDescription(): boolean {
    return !!this.description && this.description.trim().length > 0;
  }

  public hasSize(): boolean {
    return !!this.size && this.size.trim().length > 0;
  }

  public hasSKU(): boolean {
    return !!this.sku && this.sku.trim().length > 0;
  }

  public getDisplayName(): string {
    return this.hasSize() ? `${this.name} - ${this.size}` : this.name;
  }
}
