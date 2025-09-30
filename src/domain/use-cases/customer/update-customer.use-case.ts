import { UpdateCustomerDTO } from "../../dtos";
import { Customer } from "../../entities";
import { CustomError } from "../../errors/custom.errors";
import { CustomerRepository } from "../../repositories";

interface UpdateCustomerUseCase {
  execute(id: string, data: UpdateCustomerDTO): Promise<Customer>;
}

export class UpdateCustomer implements UpdateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw CustomError.notFound("El cliente no existe");

    if (data.email && data.email !== customer.email) {
      const exist = await this.customerRepository.findByEmail(data.email);
      if (exist) throw CustomError.conflict("El email ya está en uso");
    }

    if (data.rnc && data.rnc !== customer.rnc) {
      const exist = await this.customerRepository.findByRnc(data.rnc);
      if (exist) throw CustomError.conflict("El RNC ya está en uso");
    }

    return await this.customerRepository.update(id, data);
  }
}
