import { Customer, CustomerAddress } from "../customer";
import Entity from "../entity";
import { User } from "../auth";
import { Equipment } from "./Equipment";
import { ASSIGNMENT_STATUS } from "../../constants";
import { IntegerId, UUID } from "../../value-object";

export type AssignmentStatus =
  | "ACTIVO"
  | "REMOVIDO"
  | "DEVUELTO"
  | "MANTENIMIENTO"
  | "DAÑADO";

export class EquipmentAssignment extends Entity<EquipmentAssignment> {
  id!: IntegerId;
  equipmentId!: UUID;
  customerId!: UUID;
  customerAddressId!: IntegerId;
  assignedAt!: Date;
  unassignedAt?: Date | null;
  deliveredAt?: Date | null;
  status!: AssignmentStatus;
  assignedById!: UUID;
  unassignedById?: UUID | null;
  deliveredById?: UUID | null;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  //relaciones
  equipment?: Equipment;
  customerAddress?: CustomerAddress;
  customer?: Customer;
  assignedBy?: User;
  unassignedBy?: User;
  deliveredBy?: User;
  // Métodos de negocio
  public isActive(): boolean {
    return this.status === ASSIGNMENT_STATUS.ACTIVO;
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
