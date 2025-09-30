import { UpdateCustomerAddressDTO } from "../../dtos";
import { CustomerAddress } from "../../entities";
import { CustomError } from "../../errors/custom.errors";
import { CustomerRepository } from "../../repositories";

interface UpdateCustomerAddressUseCase {
  execute(
    addressId: number,
    data: UpdateCustomerAddressDTO
  ): Promise<CustomerAddress>;
}

export class UpdateCustomerAddress implements UpdateCustomerAddressUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(
    addressId: number,
    data: UpdateCustomerAddressDTO
  ): Promise<CustomerAddress> {
    const address = await this.customerRepository.findAddressById(addressId);
    if (!address) throw CustomError.notFound("La dirección no existe");

    const updatedAddress = await this.customerRepository.updateAddress(
      addressId,
      data
    );

    return updatedAddress;
  }
}
