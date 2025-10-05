import { IntegerId } from "../../value-object";
import Entity from "../entity";

export class OrderItem extends Entity<OrderItem> {
  id!: IntegerId;
  orderId!: IntegerId;
  productId!: IntegerId;
  requestedQuantity!: number;
  deliveredQuantity?: number;
  notes?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio

  public isFullyDelivered(): boolean {
    return (
      this.deliveredQuantity !== undefined &&
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
