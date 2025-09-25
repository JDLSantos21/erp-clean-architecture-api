import Entity from "../entity";
import { Customer } from "./Customer";

export enum PhoneType {
  MOVIL = "MOVIL",
  FIJO = "FIJO",
  TRABAJO = "TRABAJO",
  OTROS = "OTROS",
}

export class CustomerPhone extends Entity<CustomerPhone> {
  id!: number;
  customerId!: string;
  customer?: Customer;
  description?: string;
  phoneNumber!: string;
  type!: PhoneType;
  hasWhatsapp!: boolean;
  isPrimary!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio
  public makePrimary(): void {
    this.isPrimary = true;
    this.updatedAt = new Date();
  }

  public removePrimary(): void {
    this.isPrimary = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.isPrimary = false;
    this.updatedAt = new Date();
  }

  public enableWhatsapp(): void {
    this.hasWhatsapp = true;
    this.updatedAt = new Date();
  }

  public disableWhatsapp(): void {
    this.hasWhatsapp = false;
    this.updatedAt = new Date();
  }
}
