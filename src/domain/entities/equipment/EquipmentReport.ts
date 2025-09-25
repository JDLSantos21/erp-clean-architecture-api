import { Customer } from "../customer/Customer";
import Entity from "../entity";
import { User } from "../Users";
import { Equipment } from "./Equipment";

export enum ReportType {
  PREVENTIVO = "PREVENTIVO",
  CORRECTIVO = "CORRECTIVO",
  FALLA = "FALLA",
}

export enum ReportPriority {
  BAJA = "BAJA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  CRITICA = "CRITICA",
}

export enum ReportStatus {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  RECHAZADO = "RECHAZADO",
}

export class EquipmentReport extends Entity<EquipmentReport> {
  id!: string;
  equipmentId!: string;
  equipment?: Equipment;
  customerId?: string;
  customer?: Customer;
  reportedById!: string;
  reportedBy?: User;
  title!: string;
  description!: string;
  type!: ReportType;
  priority!: ReportPriority;
  status!: ReportStatus;
  scheduledDate?: Date;
  completedAt?: Date;
  notes?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public isPending(): boolean {
    return this.status === ReportStatus.PENDIENTE;
  }

  public isInProgress(): boolean {
    return this.status === ReportStatus.EN_PROGRESO;
  }

  public isCompleted(): boolean {
    return this.status === ReportStatus.COMPLETADO;
  }

  public isCancelled(): boolean {
    return this.status === ReportStatus.CANCELADO;
  }

  public isRejected(): boolean {
    return this.status === ReportStatus.RECHAZADO;
  }

  public isPreventive(): boolean {
    return this.type === ReportType.PREVENTIVO;
  }

  public isCorrective(): boolean {
    return this.type === ReportType.CORRECTIVO;
  }

  public isFailureReport(): boolean {
    return this.type === ReportType.FALLA;
  }

  public isCritical(): boolean {
    return this.priority === ReportPriority.CRITICA;
  }

  public isHighPriority(): boolean {
    return this.priority === ReportPriority.ALTA || this.isCritical();
  }

  public startProgress(): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede iniciar un reporte que esté pendiente");
    }
    this.status = ReportStatus.EN_PROGRESO;
  }

  public complete(): void {
    if (!this.isInProgress()) {
      throw new Error(
        "Solo se puede completar un reporte que esté en progreso"
      );
    }
    this.status = ReportStatus.COMPLETADO;
    this.completedAt = new Date();
  }

  public cancel(): void {
    if (this.isCompleted()) {
      throw new Error("No se puede cancelar un reporte que ya está completado");
    }
    this.status = ReportStatus.CANCELADO;
  }

  public reject(): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede rechazar un reporte que esté pendiente");
    }
    this.status = ReportStatus.RECHAZADO;
  }

  public isScheduled(): boolean {
    return !!this.scheduledDate;
  }

  public isOverdue(): boolean {
    if (!this.isScheduled() || this.isCompleted() || this.isCancelled()) {
      return false;
    }
    return new Date() > this.scheduledDate!;
  }

  public getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;

    const diffTime = new Date().getTime() - this.scheduledDate!.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysToComplete(): number | null {
    if (!this.isScheduled() || this.isCompleted()) return null;

    const diffTime = this.scheduledDate!.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public addNotes(additionalNotes: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${additionalNotes}`;

    this.notes = this.notes ? `${this.notes}\n${newNote}` : newNote;
  }

  public canBeStarted(): boolean {
    return this.isPending() && this.isActive;
  }

  public canBeCompleted(): boolean {
    return this.isInProgress();
  }

  public requiresUrgentAttention(): boolean {
    return this.isCritical() || (this.isHighPriority() && this.isOverdue());
  }
}
