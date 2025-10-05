import { IntegerId, UUID } from "../../value-object";
import { User } from "../auth";
import Entity from "../entity";
import { Order, OrderStatus } from "./Order";

export class OrderStatusHistory extends Entity<OrderStatusHistory> {
  id!: IntegerId;
  orderId!: UUID;
  status!: OrderStatus;
  description?: string;
  changedAt!: Date;
  changedById!: UUID;

  // relations
  order?: Order;
  changedByUser?: User;

  // Métodos de negocio

  public wasChangedTo(newStatus: OrderStatus): boolean {
    return this.status === newStatus;
  }

  public wasChangedBy(userId: UUID): boolean {
    return this.changedById === userId;
  }

  public wasChangedBefore(date: Date): boolean {
    return this.changedAt < date;
  }

  public wasChangedAfter(date: Date): boolean {
    return this.changedAt > date;
  }

  public hasDescription(): boolean {
    return !!this.description && this.description.trim().length > 0;
  }

  public canBeDescribed(): boolean {
    return this.status === "CANCELADO" || this.status === "DEVUELTO";
  }

  public isValidDescription(description: string): boolean {
    if (!this.canBeDescribed()) return false;
    const trimmedDesc = description.trim();
    return trimmedDesc.length > 0 && trimmedDesc.length <= 1000;
  }

  public setDescription(description: string): void {
    if (!this.isValidDescription(description)) {
      throw new Error("Descripción inválida para el estado actual");
    }
    this.description = description.trim();
  }
}
