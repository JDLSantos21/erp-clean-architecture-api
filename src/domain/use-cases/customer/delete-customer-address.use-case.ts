import { CustomerRepository } from "../../repositories";

interface DeleteCustomerAddressUseCase {
  execute(addressId: number): Promise<void>;
}

export class DeleteCustomerAddress implements DeleteCustomerAddressUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(addressId: number): Promise<void> {
    await this.customerRepository.deleteAddress(addressId);
  }
}
