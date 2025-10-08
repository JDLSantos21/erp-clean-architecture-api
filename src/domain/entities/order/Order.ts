import { Customer, CustomerAddress } from "../customer";
import Entity from "../entity";
import { User } from "../auth";
import { IntegerId, TrackingCode } from "../../value-object";
import { OrderStatusHistory } from "./OrderStatusHistory";
import { OrderItem } from "./OrderItem";

export type OrderStatus =
  | "PENDIENTE"
  | "PREPARANDO"
  | "DESPACHADO"
  | "ENTREGADO"
  | "CANCELADO"
  | "DEVUELTO";

export class Order extends Entity<Order> {
  id!: IntegerId;
  trackingCode!: TrackingCode;
  customerId!: string;
  customer?: Customer;
  customerAddressId!: number | null;
  customerAddress?: CustomerAddress | null;
  status!: OrderStatus;
  orderDate!: Date;
  scheduledDate?: Date | null;
  deliveredDate?: Date | null;
  createdById!: string;
  createdByUser?: User | null;
  assignedToId?: string | null;
  assignedToUser?: User | null;
  notes?: string | null;
  deliveryNotes?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  statusHistory?: OrderStatusHistory[];
  orderItems?: OrderItem[];

  // Métodos de negocio
  public isPending(): boolean {
    return this.status === "PENDIENTE";
  }

  public isPreparing(): boolean {
    return this.status === "PREPARANDO";
  }

  public isDispatched(): boolean {
    return this.status === "DESPACHADO";
  }

  public isDelivered(): boolean {
    return this.status === "ENTREGADO";
  }

  public isCancelled(): boolean {
    return this.status === "CANCELADO";
  }

  public isReturned(): boolean {
    return this.status === "DEVUELTO";
  }

  public isScheduled(): boolean {
    return !!this.scheduledDate;
  }

  public isAssigned(): boolean {
    return !!this.assignedToId;
  }

  public hasCustomerAddress(): boolean {
    return !!this.customerAddressId;
  }

  public isOverdue(): boolean {
    if (!this.isScheduled() || this.isDelivered() || this.isCancelled()) {
      return false;
    }
    return new Date() > this.scheduledDate!;
  }

  public assign(userId: string): void {
    if (!this.canBeAssigned()) {
      throw new Error(
        "El pedido debe estar pendiente o preparando para ser asignado"
      );
    }
    this.assignedToId = userId;
  }

  public canBeUnassigned(): boolean {
    return (
      this.isAssigned() &&
      (this.isPending() || this.isPreparing() || this.isDispatched())
    );
  }

  public unassign(): void {
    if (!this.isAssigned()) {
      throw new Error("El pedido no está asignado");
    }
    this.assignedToId = undefined;
  }

  public schedule(scheduledDate: Date): void {
    if (this.isCancelled() || this.isDelivered()) {
      throw new Error("No se puede programar un pedido cancelado o entregado");
    }
    this.scheduledDate = scheduledDate;
  }

  public markAsDelivered(): void {
    if (!this.isDispatched()) {
      throw new Error(
        "Solo se puede marcar como entregado un pedido despachado"
      );
    }
    this.deliveredDate = new Date();
  }

  public cancel(): void {
    if (this.isDelivered()) {
      throw new Error("No se puede cancelar un pedido ya entregado");
    }
    // Note: Status change would be handled through OrderStatusHistory
  }

  public canBeAssigned(): boolean {
    const canAssign =
      (this.isPending() || this.isPreparing() || this.isDispatched()) &&
      this.isActive &&
      !this.isAssigned();

    return canAssign;
  }

  public canBeDelivered(): boolean {
    return this.isDispatched();
  }

  public canBeCancelled(): boolean {
    return !this.isDelivered() && !this.isCancelled();
  }

  public getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;

    const diffTime = new Date().getTime() - this.scheduledDate!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysToDelivery(): number | null {
    if (!this.isScheduled() || this.isDelivered()) return null;

    const diffTime = this.scheduledDate!.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysSinceOrder(): number {
    const diffTime = new Date().getTime() - this.orderDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysSinceDelivery(): number | null {
    if (!this.deliveredDate) return null;

    const diffTime = new Date().getTime() - this.deliveredDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public addDeliveryNotes(notes: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${notes}`;

    this.deliveryNotes = this.deliveryNotes
      ? `${this.deliveryNotes}\n${newNote}`
      : newNote;
  }

  public addNotes(notes: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${notes}`;

    this.notes = this.notes ? `${this.notes}\n${newNote}` : newNote;
  }

  public requiresUrgentAttention(): boolean {
    return (
      this.isOverdue() || (this.isPending() && this.getDaysSinceOrder() > 3)
    );
  }

  public getStatusSummary(): string {
    const status = this.status;
    let summary = `Estado: ${status}`;

    if (this.isScheduled()) {
      summary += ` - Programado: ${this.scheduledDate!.toLocaleDateString()}`;
    }

    if (this.isAssigned() && this.assignedToUser) {
      summary += ` - Asignado a: ${this.assignedToUser.name}`;
    }

    return summary;
  }
}
