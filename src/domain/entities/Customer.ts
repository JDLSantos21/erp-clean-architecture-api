import Entity from "./entity";

export default class Customer extends Entity<Customer> {
  id!: number;
  name!: string;
  email!: string;
  phoneNumber!: string;
  hasWhatsApp!: boolean;
  isBusiness!: boolean;
  addresses?: CustomerAddress[];
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerAddress extends Entity<CustomerAddress> {
  id!: number;
  customerId!: number;
  description!: string;
  location?: CustomerAddressLocation;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerAddressLocation extends Entity<CustomerAddressLocation> {
  id!: number;
  addressId!: number;
  latitude!: number;
  longitude!: number;
  createdAt?: Date;
  updatedAt?: Date;
}
