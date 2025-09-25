import {
  Customer,
  CustomerAddress,
  CustomerPhone,
  EquipmentAssignment,
  PhoneType,
} from "../entities";

export interface CreateCustomerDto {
  name: string;
  email?: string;
  rnc?: string;
  isBusiness: boolean;
  contactPerson?: string;
  note?: string;
}

export interface UpdateCustomerDto {
  id: string;
  name?: string;
  email?: string;
  rnc?: string;
  isBusiness?: boolean;
  contactPerson?: string;
  note?: string;
}

export interface CreateCustomerPhoneDto {
  customerId: string;
  phoneNumber: string;
  phoneType: PhoneType;
  hasWhatsapp?: boolean;
  isPrimary?: boolean;
}

export interface CreateCustomerAddressDto {
  customerId: string;
  branchName?: string;
  street: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isPrimary?: boolean;
}

export interface CreateEquipmentAssignmentDto {
  equipmentId: string;
  customerId: string;
  customerAddressId?: number;
  assignedBy: string;
  notes?: string;
}

export interface CustomerFilters {
  name?: string;
  email?: string;
  rnc?: string;
  isBusiness?: boolean;
  isActive?: boolean;
}

export interface CustomerSummary {
  totalCustomers: number;
  businessCustomers: number;
  individualCustomers: number;
  activeAssignments: number;
  totalEquipmentAssigned: number;
  pendingReports: number;
}

export abstract class CustomerDatasource {
  // Customer CRUD Operations
  abstract createCustomer(
    createCustomerDto: CreateCustomerDto
  ): Promise<Customer>;
  abstract getCustomerById(id: string): Promise<Customer>;
  abstract getAllCustomers(filters?: CustomerFilters): Promise<Customer[]>;
  abstract updateCustomer(
    updateCustomerDto: UpdateCustomerDto
  ): Promise<Customer>;
  abstract deleteCustomer(id: string): Promise<Customer>;

  // Customer Phone Operations
  abstract addCustomerPhone(
    createPhoneDto: CreateCustomerPhoneDto
  ): Promise<CustomerPhone>;
  abstract getCustomerPhones(customerId: string): Promise<CustomerPhone[]>;
  abstract updateCustomerPhone(
    phoneId: number,
    updates: Partial<CreateCustomerPhoneDto>
  ): Promise<CustomerPhone>;
  abstract deleteCustomerPhone(phoneId: number): Promise<CustomerPhone>;
  abstract setPrimaryPhone(phoneId: number): Promise<CustomerPhone>;

  // Customer Address Operations
  abstract addCustomerAddress(
    createAddressDto: CreateCustomerAddressDto
  ): Promise<CustomerAddress>;
  abstract getCustomerAddresses(customerId: string): Promise<CustomerAddress[]>;
  abstract updateCustomerAddress(
    addressId: number,
    updates: Partial<CreateCustomerAddressDto>
  ): Promise<CustomerAddress>;
  abstract deleteCustomerAddress(addressId: number): Promise<CustomerAddress>;
  abstract setPrimaryAddress(addressId: number): Promise<CustomerAddress>;

  // Equipment Assignment Operations
  abstract assignEquipment(
    assignmentDto: CreateEquipmentAssignmentDto
  ): Promise<EquipmentAssignment>;
  abstract getCustomerAssignments(
    customerId: string
  ): Promise<EquipmentAssignment[]>;
  abstract getEquipmentAssignments(
    equipmentId: string
  ): Promise<EquipmentAssignment[]>;
  abstract returnEquipment(
    assignmentId: number,
    unassignedBy: string,
    notes?: string
  ): Promise<EquipmentAssignment>;
  abstract markEquipmentAsLost(
    assignmentId: number,
    notes?: string
  ): Promise<EquipmentAssignment>;
  abstract markEquipmentAsDamaged(
    assignmentId: number,
    notes?: string
  ): Promise<EquipmentAssignment>;
  abstract sendEquipmentToMaintenance(
    assignmentId: number,
    notes?: string
  ): Promise<EquipmentAssignment>;

  // Query Operations
  abstract getCustomerWithFullData(customerId: string): Promise<
    Customer & {
      phones: CustomerPhone[];
      addresses: CustomerAddress[];
      equipmentAssignments: EquipmentAssignment[];
    }
  >;
  abstract searchCustomers(query: string): Promise<Customer[]>;
  abstract getCustomersByEquipment(equipmentId: string): Promise<Customer[]>;
  abstract getActiveAssignments(): Promise<EquipmentAssignment[]>;

  // Analytics and Reporting
  abstract getCustomerSummary(): Promise<CustomerSummary>;
  abstract getCustomerEquipmentHistory(
    customerId: string
  ): Promise<EquipmentAssignment[]>;
  abstract getTopCustomersByEquipmentCount(): Promise<
    Array<Customer & { equipmentCount: number }>
  >;

  // Business Operations
  abstract validatePhoneUniqueness(
    phoneNumber: string,
    excludePhoneId?: number
  ): Promise<boolean>;
  abstract validateRncUniqueness(
    rnc: string,
    excludeCustomerId?: string
  ): Promise<boolean>;
  abstract transferEquipment(
    assignmentId: number,
    newCustomerId: string,
    newAddressId?: number,
    transferredBy?: string
  ): Promise<EquipmentAssignment>;
}
