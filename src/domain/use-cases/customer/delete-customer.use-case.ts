import { CustomError } from "../../errors/custom.errors";
import { CustomerRepository } from "../../repositories";

interface DeleteCustomerUseCase {
  execute(customerId: string): Promise<void>;
}

export class DeleteCustomer implements DeleteCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(customerId: string): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw CustomError.notFound("El cliente no existe");

    if (customer.hasActiveAddresses())
      throw CustomError.badRequest(
        "El cliente tiene direcciones activas, desactívelas antes de eliminar el cliente"
      );

    if (customer.hasActivePhones())
      throw CustomError.badRequest(
        "El cliente tiene teléfonos activos, desactívelos antes de eliminar el cliente"
      );

    await this.customerRepository.delete(customerId);
  }
}
