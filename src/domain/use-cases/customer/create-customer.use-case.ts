import { RegisterCustomerDTO } from "../../dtos";
import { Customer } from "../../entities";
import { CustomError } from "../../errors";
import { CustomerRepository } from "../../repositories";

interface CreateCustomerUseCase {
  execute(data: RegisterCustomerDTO): Promise<Customer>;
}

export class CreateCustomer implements CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(data: RegisterCustomerDTO): Promise<Customer> {
    //Steps
    // 1. Validate data (DTO)

    // 2. Check for duplicates (email, rnc)
    if (data.email) {
      const exist = await this.customerRepository.findByEmail(data.email);
      if (exist) throw CustomError.conflict("El email ya está en uso");
    }

    if (data.rnc) {
      const exist = await this.customerRepository.findByRnc(data.rnc);
      if (exist) throw CustomError.conflict("El RNC ya está en uso");
    }

    // 3. Check for duplicate phone numbers
    for (const phone of data.phones) {
      const exist = await this.customerRepository.findPhoneByNumber(
        phone.phoneNumber
      );

      if (exist)
        throw CustomError.conflict(
          `El número de teléfono ${phone.phoneNumber} ya está en uso`
        );
    }

    // 4. Create customer
    return await this.customerRepository.create(data);
  }
}
