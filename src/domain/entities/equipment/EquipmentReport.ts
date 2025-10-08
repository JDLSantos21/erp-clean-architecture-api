import { Customer } from "../customer";
import Entity from "../entity";
import { User } from "../auth";
import { Equipment } from "./Equipment";
import { REPORT_PRIORITY, REPORT_STATUS, REPORT_TYPE } from "../../constants";

export type ReportType = keyof typeof REPORT_TYPE;
export type ReportPriority = keyof typeof REPORT_PRIORITY;
export type ReportStatus = keyof typeof REPORT_STATUS;

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
    return this.status === REPORT_STATUS.PENDIENTE;
  }

  public isInProgress(): boolean {
    return this.status === REPORT_STATUS.EN_PROGRESO;
  }

  public isCompleted(): boolean {
    return this.status === REPORT_STATUS.COMPLETADO;
  }

  public isCancelled(): boolean {
    return this.status === REPORT_STATUS.CANCELADO;
  }

  public isRejected(): boolean {
    return this.status === REPORT_STATUS.RECHAZADO;
  }

  public isPreventive(): boolean {
    return this.type === REPORT_TYPE.PREVENTIVO;
  }

  public isCorrective(): boolean {
    return this.type === REPORT_TYPE.CORRECTIVO;
  }

  public isFailureReport(): boolean {
    return this.type === REPORT_TYPE.FALLA;
  }

  public isCritical(): boolean {
    return this.priority === REPORT_PRIORITY.CRITICA;
  }

  public isHighPriority(): boolean {
    return this.priority === REPORT_PRIORITY.ALTA || this.isCritical();
  }

  public startProgress(): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede iniciar un reporte que esté pendiente");
    }
    this.status = REPORT_STATUS.EN_PROGRESO;
  }

  public complete(): void {
    if (!this.isInProgress()) {
      throw new Error(
        "Solo se puede completar un reporte que esté en progreso"
      );
    }
    this.status = REPORT_STATUS.COMPLETADO;
    this.completedAt = new Date();
  }

  public cancel(): void {
    if (this.isCompleted()) {
      throw new Error("No se puede cancelar un reporte que ya está completado");
    }
    this.status = REPORT_STATUS.CANCELADO;
  }

  public reject(): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede rechazar un reporte que esté pendiente");
    }
    this.status = REPORT_STATUS.RECHAZADO;
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
