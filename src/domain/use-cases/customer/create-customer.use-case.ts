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
    if (data.email) {
      const exist = await this.customerRepository.findByEmail(data.email);
      if (exist) throw CustomError.conflict("El email ya está en uso");
    }

    if (data.rnc) {
      const exist = await this.customerRepository.findByRnc(data.rnc);
      if (exist) throw CustomError.conflict("El RNC ya está en uso");
    }

    for (const phone of data.phones) {
      const exist = await this.customerRepository.findPhoneByNumber(
        phone.phoneNumber
      );

      if (exist)
        throw CustomError.conflict(
          `El número de teléfono ${phone.phoneNumber} ya está en uso`
        );
    }

    const primaryPhones = data.phones.filter((phone) => phone.isPrimary);
    if (primaryPhones.length > 1)
      throw CustomError.conflict("Solo puede haber un teléfono principal");

    const primaryAddresses = data.addresses.filter(
      (address) => address.isPrimary
    );
    if (primaryAddresses.length > 1)
      throw CustomError.conflict("Solo puede haber una dirección principal");

    // 4. Create customer
    return await this.customerRepository.create(data);
  }
}
