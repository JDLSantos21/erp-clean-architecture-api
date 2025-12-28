import {
  CreateCustomerAddressDTO,
  CreateCustomerPhoneDTO,
  Customer,
  CustomerAddress,
  CustomerDatasource,
  CustomerPhone,
  CustomerQueryDTO,
  CustomerRepository,
  RegisterCustomerDTO,
  UpdateCustomerDTO,
  UpdateCustomerPhoneDto,
  FilterParams,
  UUID,
} from "../../domain";

export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(private readonly customerDatasource: CustomerDatasource) {}

  async create(registerCustomerDto: RegisterCustomerDTO): Promise<Customer> {
    return this.customerDatasource.create(registerCustomerDto);
  }

  async createAddress(
    customerId: string,
    address: CreateCustomerAddressDTO
  ): Promise<CustomerAddress> {
    return this.customerDatasource.createAddress(customerId, address);
  }

  async createPhone(
    customerId: string,
    data: CreateCustomerPhoneDTO
  ): Promise<CustomerPhone> {
    return this.customerDatasource.createPhone(customerId, data);
  }

  async findById(
    id: string,
    relations?: { orders?: boolean }
  ): Promise<Customer | null> {
    return this.customerDatasource.findById(id, relations);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerDatasource.findByEmail(email);
  }

  async findByRnc(rnc: string): Promise<Customer | null> {
    return this.customerDatasource.findByRnc(rnc);
  }

  async findPhoneById(id: number): Promise<CustomerPhone | null> {
    return this.customerDatasource.findPhoneById(id);
  }

  async findPhoneByNumber(phoneNumber: string): Promise<CustomerPhone | null> {
    return this.customerDatasource.findPhoneByNumber(phoneNumber);
  }

  async findAddressById(id: number): Promise<CustomerAddress | null> {
    return this.customerDatasource.findAddressById(id);
  }

  async findPrimaryPhone(customerId: UUID): Promise<CustomerPhone> {
    return this.customerDatasource.findPrimaryPhone(customerId);
  }

  async findPrimaryAddress(customerId: UUID): Promise<CustomerAddress> {
    return this.customerDatasource.findPrimaryAddress(customerId);
  }

  async list(
    params: FilterParams<CustomerQueryDTO>
  ): Promise<{ customers: Customer[]; total: number }> {
    return this.customerDatasource.list(params);
  }

  async listAddresses(customerId: string): Promise<CustomerAddress[]> {
    return this.customerDatasource.listAddresses(customerId);
  }

  async listPhones(customerId: string): Promise<CustomerPhone[]> {
    return this.customerDatasource.listPhones(customerId);
  }

  async delete(customerId: string): Promise<void> {
    return this.customerDatasource.delete(customerId);
  }

  async deleteAddress(addressId: number): Promise<void> {
    return this.customerDatasource.deleteAddress(addressId);
  }

  async deletePhone(phoneId: number): Promise<void> {
    return this.customerDatasource.deletePhone(phoneId);
  }

  async setPrimaryAddress(
    customerId: string,
    addressId: number
  ): Promise<void> {
    return this.customerDatasource.setPrimaryAddress(customerId, addressId);
  }

  async setPrimaryPhone(customerId: string, phoneId: number): Promise<void> {
    return this.customerDatasource.setPrimaryPhone(customerId, phoneId);
  }

  async active(customerId: string): Promise<void> {
    return this.customerDatasource.active(customerId);
  }

  async deactive(customerId: string): Promise<void> {
    return this.customerDatasource.deactive(customerId);
  }

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    return this.customerDatasource.update(id, data);
  }

  async updateAddress(
    addressId: number,
    address: Partial<CreateCustomerAddressDTO>
  ): Promise<CustomerAddress> {
    return this.customerDatasource.updateAddress(addressId, address);
  }

  async updatePhone(
    phoneId: number,
    phone: Partial<UpdateCustomerPhoneDto>
  ): Promise<CustomerPhone> {
    return this.customerDatasource.updatePhone(phoneId, phone);
  }
}
