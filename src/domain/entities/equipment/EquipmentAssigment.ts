import { Customer } from "../customer/Customer";
import { CustomerAddress } from "../customer/CustomerAddress";
import Entity from "../entity";
import { User } from "../Users";
import { Equipment } from "./Equipment";

export enum AssignmentStatus {
  ASIGNADO = "ASIGNADO",
  REMOVIDO = "REMOVIDO",
  DEVUELTO = "DEVUELTO",
  MANTENIMIENTO = "MANTENIMIENTO",
  DAÑADO = "DAÑADO",
}

export class EquipmentAssignment extends Entity<EquipmentAssignment> {
  id!: string;
  equipmentId!: string;
  equipment?: Equipment;
  customerId!: string;
  customer?: Customer;
  customerAddressId?: string;
  customerAddress?: CustomerAddress;
  assignedAt!: Date;
  unassignedAt?: Date;
  deliveredAt?: Date;
  status!: AssignmentStatus;
  assignedById!: string;
  assignedBy?: User;
  unassignedById?: string;
  unassignedBy?: User;
  deliveredById?: string;
  deliveredBy?: User;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public isActive(): boolean {
    return this.status === AssignmentStatus.ASIGNADO;
  }

  public isRemoved(): boolean {
    return this.status === AssignmentStatus.REMOVIDO;
  }

  public isReturned(): boolean {
    return this.status === AssignmentStatus.DEVUELTO;
  }

  public isInMaintenance(): boolean {
    return this.status === AssignmentStatus.MANTENIMIENTO;
  }

  public isDamaged(): boolean {
    return this.status === AssignmentStatus.DAÑADO;
  }

  public isDelivered(): boolean {
    return !!this.deliveredAt;
  }

  public remove(userId: string): void {
    if (!this.isActive()) {
      throw new Error("Solo se puede remover un equipo que esté asignado");
    }

    this.status = AssignmentStatus.REMOVIDO;
    this.unassignedAt = new Date();
    this.unassignedById = userId;
  }

  public markAsReturned(userId: string): void {
    if (!this.isActive() && !this.isRemoved()) {
      throw new Error(
        "Solo se puede marcar como devuelto un equipo asignado o removido"
      );
    }

    this.status = AssignmentStatus.DEVUELTO;
    this.unassignedAt = new Date();
    this.unassignedById = userId;
  }

  public sendToMaintenance(): void {
    if (!this.isActive()) {
      throw new Error(
        "Solo se puede enviar a mantenimiento un equipo activamente asignado"
      );
    }

    this.status = AssignmentStatus.MANTENIMIENTO;
  }

  public markAsDamaged(): void {
    this.status = AssignmentStatus.DAÑADO;
  }

  public deliver(userId: string): void {
    if (this.isDelivered()) {
      throw new Error("El equipo ya ha sido entregado");
    }

    this.deliveredAt = new Date();
    this.deliveredById = userId;
  }

  public canBeRemoved(): boolean {
    return this.isActive();
  }

  public canBeSentToMaintenance(): boolean {
    return this.isActive();
  }

  public getDaysAssigned(): number {
    const endDate = this.unassignedAt || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.assignedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysSinceDelivery(): number | null {
    if (!this.deliveredAt) return null;

    const diffTime = Math.abs(
      new Date().getTime() - this.deliveredAt.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public addNotes(additionalNotes: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${additionalNotes}`;

    this.notes = this.notes ? `${this.notes}\n${newNote}` : newNote;
  }
}
