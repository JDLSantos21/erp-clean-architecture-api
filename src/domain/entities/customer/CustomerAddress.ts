import Entity from "../entity";
import { Customer } from "./Customer";

export class CustomerAddress extends Entity<CustomerAddress> {
  id!: number;
  customerId!: string;
  customer?: Customer;
  branchName?: string | null;

  direction!: string;
  city!: string;
  latitude?: number | null;
  longitude?: number | null;
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

  public hasGpsCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }

  public setGpsCoordinates(latitude: number, longitude: number): void {
    this.latitude = latitude;
    this.longitude = longitude;
    this.updatedAt = new Date();
  }

  public clearGpsCoordinates(): void {
    this.latitude = undefined;
    this.longitude = undefined;
    this.updatedAt = new Date();
  }

  public getFullAddress(): string {
    return this.branchName
      ? `${this.branchName}, ${this.direction}, ${this.city}`
      : `${this.direction}, ${this.city}`;
  }
}
