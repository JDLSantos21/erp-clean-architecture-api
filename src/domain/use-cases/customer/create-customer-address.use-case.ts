import { CreateCustomerAddressDTO } from "../../dtos";
import { CustomerAddress } from "../../entities";
import { CustomError } from "../../errors/custom.errors";
import { CustomerRepository } from "../../repositories";

interface CreateCustomerAddressUseCase {
  execute(
    customerId: string,
    data: CreateCustomerAddressDTO
  ): Promise<CustomerAddress>;
}

export class CreateCustomerAddress implements CreateCustomerAddressUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(
    customerId: string,
    data: CreateCustomerAddressDTO
  ): Promise<CustomerAddress> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw CustomError.notFound("El cliente no existe");

    if (data.isPrimary) {
      const addressesList = await this.customerRepository.listAddresses(
        customerId
      );
      const primaryAddress = addressesList.find((address) => address.isPrimary);
      if (primaryAddress)
        throw CustomError.conflict(
          `El cliente ya tiene una dirección primaria: ${primaryAddress.direction}`
        );
    }

    return await this.customerRepository.createAddress(customerId, data);
  }
}
