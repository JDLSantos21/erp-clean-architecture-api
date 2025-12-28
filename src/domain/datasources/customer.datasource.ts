import {
  CreateCustomerAddressDTO,
  CreateCustomerPhoneDTO,
  CustomerQueryDTO,
  RegisterCustomerDTO,
  UpdateCustomerAddressDTO,
  UpdateCustomerDTO,
  UpdateCustomerPhoneDto,
} from "../dtos";
import { Customer, CustomerAddress, CustomerPhone } from "../entities";
import { FilterParams } from "../types";
import { UUID } from "../value-object";

// export interface UpdateCustomerDto {
//   id: string;
//   name?: string;
//   email?: string;
//   rnc?: string;
//   isBusiness?: boolean;
//   contactPerson?: string;
//   note?: string;
// }

// export interface CustomerFilters {
//   name?: string;
//   email?: string;
//   rnc?: string;
//   isBusiness?: boolean;
//   isActive?: boolean;
// }

// export interface CustomerSummary {
//   totalCustomers: number;
//   businessCustomers: number;
//   individualCustomers: number;
//   activeAssignments: number;
//   totalEquipmentAssigned: number;
//   pendingReports: number;
// }

export abstract class CustomerDatasource {
  abstract create(registerCustomerDto: RegisterCustomerDTO): Promise<Customer>;
  abstract update(id: string, data: UpdateCustomerDTO): Promise<Customer>;
  abstract list(
    params: FilterParams<CustomerQueryDTO>
  ): Promise<{ customers: Customer[]; total: number }>;

  abstract createAddress(
    customerId: string,
    address: CreateCustomerAddressDTO
  ): Promise<CustomerAddress>;
  abstract createPhone(
    customerId: string,
    data: CreateCustomerPhoneDTO
  ): Promise<CustomerPhone>;

  abstract updateAddress(
    addressId: number,
    address: Partial<UpdateCustomerAddressDTO>
  ): Promise<CustomerAddress>;
  abstract updatePhone(
    phoneId: number,
    phone: Partial<UpdateCustomerPhoneDto>
  ): Promise<CustomerPhone>;

  abstract listAddresses(customerId: string): Promise<CustomerAddress[]>;
  abstract listPhones(customerId: string): Promise<CustomerPhone[]>;

  abstract findAddressById(id: number): Promise<CustomerAddress | null>;
  abstract findPhoneById(id: number): Promise<CustomerPhone | null>;
  abstract findPhoneByNumber(
    phoneNumber: string
  ): Promise<CustomerPhone | null>;
  abstract findPrimaryPhone(customerId: UUID): Promise<CustomerPhone>;
  abstract findPrimaryAddress(customerId: UUID): Promise<CustomerAddress>;

  abstract setPrimaryAddress(
    customerId: string,
    addressId: number
  ): Promise<void>;
  abstract setPrimaryPhone(customerId: string, phoneId: number): Promise<void>;

  abstract findById(
    id: string,
    relations?: { orders?: boolean }
  ): Promise<Customer | null>;
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract findByRnc(rnc: string): Promise<Customer | null>;

  abstract delete(customerId: string): Promise<void>;
  abstract deleteAddress(addressId: number): Promise<void>;
  abstract deletePhone(phoneId: number): Promise<void>;

  abstract active(customerId: string): Promise<void>;
  abstract deactive(customerId: string): Promise<void>;
}
