import { Customer } from "../customer";
import Entity from "../entity";
import { User } from "../auth";
import { EquipmentModel } from "./EquipmentModel";
import { REQUEST_STATUS } from "../../constants";

export type RequestStatus = keyof typeof REQUEST_STATUS;

export class EquipmentRequest extends Entity<EquipmentRequest> {
  id!: string;
  customerId!: string;
  customer?: Customer;
  equipmentModelId!: number;
  equipmentModel?: EquipmentModel;
  description!: string;
  status!: RequestStatus;
  contactName!: string;
  contactPhone!: string;
  contactEmail?: string;
  businessName?: string;
  businessType?: string;
  address?: string;
  requestedById!: string;
  requestedBy?: User;
  processedById?: string;
  processedBy?: User;
  requestedDate!: Date;
  processedDate?: Date;
  notes?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public isPending(): boolean {
    return this.status === REQUEST_STATUS.PENDIENTE;
  }

  public isApproved(): boolean {
    return this.status === REQUEST_STATUS.APROBADO;
  }

  public isCompleted(): boolean {
    return this.status === REQUEST_STATUS.COMPLETADO;
  }

  public isCancelled(): boolean {
    return this.status === REQUEST_STATUS.CANCELADO;
  }

  public isRejected(): boolean {
    return this.status === REQUEST_STATUS.RECHAZADO;
  }

  public isExpired(): boolean {
    return this.status === REQUEST_STATUS.EXPIRADO;
  }

  public approve(userId: string): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede aprobar una solicitud pendiente");
    }
    this.status = REQUEST_STATUS.APROBADO;
    this.processedById = userId;
    this.processedDate = new Date();
  }

  public reject(userId: string, reason?: string): void {
    if (!this.isPending()) {
      throw new Error("Solo se puede rechazar una solicitud pendiente");
    }
    this.status = REQUEST_STATUS.RECHAZADO;
    this.processedById = userId;
    this.processedDate = new Date();

    if (reason) {
      this.addNotes(`Rechazado: ${reason}`);
    }
  }

  public complete(): void {
    if (!this.isApproved()) {
      throw new Error("Solo se puede completar una solicitud aprobada");
    }
    this.status = REQUEST_STATUS.COMPLETADO;
  }

  public cancel(): void {
    if (this.isCompleted()) {
      throw new Error("No se puede cancelar una solicitud completada");
    }
    this.status = REQUEST_STATUS.CANCELADO;
  }

  public expire(): void {
    if (!this.isPending()) {
      throw new Error("Solo solicitudes pendientes pueden expirar");
    }
    this.status = REQUEST_STATUS.EXPIRADO;
  }

  public hasContactEmail(): boolean {
    return !!this.contactEmail && this.contactEmail.trim().length > 0;
  }

  public hasBusinessInfo(): boolean {
    return !!this.businessName && this.businessName.trim().length > 0;
  }

  public hasAddress(): boolean {
    return !!this.address && this.address.trim().length > 0;
  }

  public isProcessed(): boolean {
    return !!this.processedDate && !!this.processedById;
  }

  public canBeProcessed(): boolean {
    return this.isPending() && this.isActive;
  }

  public getDaysSinceRequest(): number {
    const diffTime = new Date().getTime() - this.requestedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getDaysSinceProcessed(): number | null {
    if (!this.processedDate) return null;

    const diffTime = new Date().getTime() - this.processedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getContactSummary(): string {
    let contact = `${this.contactName} - ${this.contactPhone}`;

    if (this.hasContactEmail()) {
      contact += ` - ${this.contactEmail}`;
    }

    return contact;
  }

  public addNotes(additionalNotes: string): void {
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${additionalNotes}`;

    this.notes = this.notes ? `${this.notes}\n${newNote}` : newNote;
  }

  public requiresUrgentAttention(): boolean {
    const urgentDays = 7; // Más de 7 días sin procesar
    return this.isPending() && this.getDaysSinceRequest() > urgentDays;
  }
}
