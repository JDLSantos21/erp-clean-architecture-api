import { IntegerId } from "../../value-object";
import Entity from "../entity";
import { Product } from "./Product";

export class OrderItem extends Entity<OrderItem> {
  id!: IntegerId;
  orderId!: IntegerId;
  productId!: IntegerId;
  requestedQuantity!: number;
  deliveredQuantity?: number | null;
  notes?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  product?: Product;

  // Métodos de negocio

  public isFullyDelivered(): boolean {
    return (
      this.deliveredQuantity !== undefined &&
      this.deliveredQuantity !== null &&
      this.deliveredQuantity >= this.requestedQuantity
    );
  }

  public hasNotes(): boolean {
    return !!this.notes && this.notes.trim().length > 0;
  }

  public hasDeliveredQuantity(): boolean {
    return this.deliveredQuantity !== undefined;
  }

  public canBeModified(): boolean {
    return !this.isFullyDelivered();
  }
}
