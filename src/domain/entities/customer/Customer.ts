import Entity from "../entity";
import { CustomerAddress } from "./CustomerAddress";
import { CustomerPhone } from "./CustomerPhone";

export class Customer extends Entity<Customer> {
  id!: string;
  businessName!: string;
  representativeName!: string;
  rnc?: string;
  email?: string;
  notes?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  phones?: CustomerPhone[];
  addresses?: CustomerAddress[];

  public hasRnc(): boolean {
    return !!this.rnc && this.rnc.trim().length > 0;
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public getPrimaryPhone(): CustomerPhone | undefined {
    return this.phones?.find((phone) => phone.isPrimary && phone.isActive);
  }

  public getPrimaryAddress(): CustomerAddress | undefined {
    return this.addresses?.find(
      (address) => address.isPrimary && address.isActive
    );
  }

  public hasActivePhones(): boolean {
    return !!this.phones?.some((phone) => phone.isActive);
  }

  public hasActiveAddresses(): boolean {
    return !!this.addresses?.some((address) => address.isActive);
  }
}
