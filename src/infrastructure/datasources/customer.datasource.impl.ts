import { PrismaClient } from "@prisma/client";
import {
  CreateCustomerAddressDTO,
  CreateCustomerPhoneDTO,
  Customer,
  CustomerAddress,
  CustomerDatasource,
  CustomerPhone,
  CustomerQueryDTO,
  CustomError,
  FilterParams,
  RegisterCustomerDTO,
  UpdateCustomerDTO,
  UpdateCustomerPhoneDto,
  UUID,
} from "../../domain";
import { buildWhere, CustomerMapper } from "../mappers";

export class CustomerDatasourceImpl extends CustomerDatasource {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }
  async create(data: RegisterCustomerDTO): Promise<Customer> {
    const { phones, addresses, ...customerData } = data;

    console.log("Creating customer with data:", data);

    try {
      const newCustomer = await this.prisma.$transaction(async (tx) => {
        const createdCustomer = await tx.customer.create({
          data: {
            ...customerData,
          },
        });

        const createdPhones = phones.map((phone) => ({
          ...phone,
          customerId: createdCustomer.id,
        }));

        const createdAddresses = addresses.map((address) => ({
          ...address,
          customerId: createdCustomer.id,
        }));

        await tx.customerPhone.createMany({
          data: createdPhones,
        });

        await tx.customerAddress.createMany({
          data: createdAddresses,
        });

        return createdCustomer;
      });

      const customerWithRelations = await this.prisma.customer.findUnique({
        where: { id: newCustomer.id },
        include: {
          phones: true,
          addresses: true,
        },
      });

      if (!customerWithRelations) {
        throw new CustomError(
          500,
          "El cliente fue creado pero hubo un error al obtener sus datos"
        );
      }

      return CustomerMapper.customerEntityFromObject(customerWithRelations);
    } catch (error) {
      throw new CustomError(500, "Error creating customer");
    }
  }

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new Customer(updatedCustomer);
  }

  async list(
    params: FilterParams<CustomerQueryDTO>
  ): Promise<{ customers: Customer[]; total: number }> {
    const { filters, limit, skip } = params;

    const where = buildWhere(filters!, [
      "businessName",
      "representativeName",
      "rnc",
      "email",
    ]);

    const [customers, total] = await Promise.all([
      await this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          phones: true,
          addresses: true,
        },
      }),
      await this.prisma.customer.count({ where }),
    ]);

    const customersWithRelations = customers.map((customer) =>
      CustomerMapper.customerEntityFromObject(customer)
    );

    return { customers: customersWithRelations, total };
  }

  async findById(
    id: string,
    relations?: { orders?: boolean }
  ): Promise<Customer | null> {
    //optional includes

    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        phones: true,
        addresses: true,
        orders: relations?.orders
          ? {
              include: {
                orderItems: { include: { product: true } },
              },
            }
          : false,
      },
    });

    if (!customer) return null;

    return CustomerMapper.customerEntityFromObject(customer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { email },
      include: {
        phones: true,
        addresses: true,
      },
    });
    if (!customer) return null;

    return CustomerMapper.customerEntityFromObject(customer);
  }

  async findByRnc(rnc: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { rnc },
      include: {
        phones: true,
        addresses: true,
      },
    });
    if (!customer) return null;
    return CustomerMapper.customerEntityFromObject(customer);
  }

  async active(customerId: string): Promise<void> {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { isActive: true },
    });
  }

  async deactive(customerId: string): Promise<void> {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { isActive: false },
    });
  }

  async delete(customerId: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id: customerId },
    });
  }

  async createPhone(
    customerId: string,
    data: CreateCustomerPhoneDTO
  ): Promise<CustomerPhone> {
    const createdPhone = await this.prisma.customerPhone.create({
      data: {
        ...data,
        customerId,
      },
    });

    return CustomerMapper.customerPhoneEntityFromObject(createdPhone);
  }

  async updatePhone(
    phoneId: number,
    phone: Partial<UpdateCustomerPhoneDto>
  ): Promise<CustomerPhone> {
    const { customerId, ...phoneData } = phone;
    const updatedPhone = await this.prisma.customerPhone.update({
      where: { id: phoneId },
      data: phoneData,
    });
    return CustomerMapper.customerPhoneEntityFromObject(updatedPhone);
  }

  async listPhones(customerId: string): Promise<CustomerPhone[]> {
    const phones = await this.prisma.customerPhone.findMany({
      where: { customerId },
    });
    return phones.map((phone) =>
      CustomerMapper.customerPhoneEntityFromObject(phone)
    );
  }

  async deletePhone(phoneId: number): Promise<void> {
    await this.prisma.customerPhone.delete({
      where: { id: phoneId },
    });
  }

  async findPhoneById(id: number): Promise<CustomerPhone | null> {
    const phone = await this.prisma.customerPhone.findUnique({
      where: { id },
    });
    if (!phone) return null;
    return CustomerMapper.customerPhoneEntityFromObject(phone);
  }

  async findPhoneByNumber(phoneNumber: string): Promise<CustomerPhone | null> {
    const phone = await this.prisma.customerPhone.findFirst({
      where: { phoneNumber },
    });
    if (!phone) return null;
    return CustomerMapper.customerPhoneEntityFromObject(phone);
  }

  async findPrimaryPhone(customerId: UUID): Promise<CustomerPhone> {
    const phone = await this.prisma.customerPhone.findFirst({
      where: { customerId: customerId.value, isPrimary: true },
    });
    if (!phone) throw new Error("No se pudo encontrar el teléfono primario");
    return CustomerMapper.customerPhoneEntityFromObject(phone);
  }

  async setPrimaryPhone(customerId: string, phoneId: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.customerPhone.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
      await tx.customerPhone.update({
        where: { id: phoneId },
        data: { isPrimary: true },
      });
    });
  }

  async createAddress(
    customerId: string,
    address: CreateCustomerAddressDTO
  ): Promise<CustomerAddress> {
    const createdAddress = await this.prisma.customerAddress.create({
      data: {
        ...address,
        customerId,
      },
    });
    return CustomerMapper.customerAddressEntityFromObject(createdAddress);
  }

  async updateAddress(
    addressId: number,
    address: Partial<CreateCustomerAddressDTO>
  ): Promise<CustomerAddress> {
    const updatedAddress = await this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        ...address,
      },
    });
    return CustomerMapper.customerAddressEntityFromObject(updatedAddress);
  }

  async listAddresses(customerId: string): Promise<CustomerAddress[]> {
    const addresses = await this.prisma.customerAddress.findMany({
      where: { customerId },
    });
    return addresses.map((address) =>
      CustomerMapper.customerAddressEntityFromObject(address)
    );
  }

  async findPrimaryAddress(customerId: UUID): Promise<CustomerAddress> {
    const address = await this.prisma.customerAddress.findFirst({
      where: { customerId: customerId.value, isPrimary: true },
    });
    if (!address) throw new Error("No se pudo encontrar la dirección primaria");
    return CustomerMapper.customerAddressEntityFromObject(address);
  }

  async deleteAddress(addressId: number): Promise<void> {
    await this.prisma.customerAddress.delete({
      where: { id: addressId },
    });
  }

  async findAddressById(id: number): Promise<CustomerAddress | null> {
    const address = await this.prisma.customerAddress.findUnique({
      where: { id },
    });
    if (!address) return null;
    return CustomerMapper.customerAddressEntityFromObject(address);
  }

  async setPrimaryAddress(
    customerId: string,
    addressId: number
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
      await tx.customerAddress.update({
        where: { id: addressId },
        data: { isPrimary: true },
      });
    });
  }
}
