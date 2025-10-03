import { Customer, CustomerAddress } from "../customer";
import Entity from "../entity";
import { User } from "../auth";
import { Equipment } from "./Equipment";

export type AssignmentStatus =
  | "ASIGNADO"
  | "REMOVIDO"
  | "DEVUELTO"
  | "MANTENIMIENTO"
  | "DAÑADO";

export const ASSIGNMENT_STATUS = {
  ASIGNADO: "ASIGNADO" as const,
  REMOVIDO: "REMOVIDO" as const,
  DEVUELTO: "DEVUELTO" as const,
  MANTENIMIENTO: "MANTENIMIENTO" as const,
  DAÑADO: "DAÑADO" as const,
} as const;

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
    return this.status === ASSIGNMENT_STATUS.ASIGNADO;
  }

  public isRemoved(): boolean {
    return this.status === ASSIGNMENT_STATUS.REMOVIDO;
  }

  public isReturned(): boolean {
    return this.status === ASSIGNMENT_STATUS.DEVUELTO;
  }

  public isInMaintenance(): boolean {
    return this.status === ASSIGNMENT_STATUS.MANTENIMIENTO;
  }

  public isDamaged(): boolean {
    return this.status === ASSIGNMENT_STATUS.DAÑADO;
  }

  public isDelivered(): boolean {
    return !!this.deliveredAt;
  }

  public remove(userId: string): void {
    if (!this.isActive()) {
      throw new Error("Solo se puede remover un equipo que esté asignado");
    }

    this.status = ASSIGNMENT_STATUS.REMOVIDO;
    this.unassignedAt = new Date();
    this.unassignedById = userId;
  }

  public markAsReturned(userId: string): void {
    if (!this.isActive() && !this.isRemoved()) {
      throw new Error(
        "Solo se puede marcar como devuelto un equipo asignado o removido"
      );
    }

    this.status = ASSIGNMENT_STATUS.DEVUELTO;
    this.unassignedAt = new Date();
    this.unassignedById = userId;
  }

  public sendToMaintenance(): void {
    if (!this.isActive()) {
      throw new Error(
        "Solo se puede enviar a mantenimiento un equipo activamente asignado"
      );
    }

    this.status = ASSIGNMENT_STATUS.MANTENIMIENTO;
  }

  public markAsDamaged(): void {
    this.status = ASSIGNMENT_STATUS.DAÑADO;
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
