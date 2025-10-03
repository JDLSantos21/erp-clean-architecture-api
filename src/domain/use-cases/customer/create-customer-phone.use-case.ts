import { CreateCustomerPhoneDTO } from "../../dtos";
import { CustomerPhone } from "../../entities";
import { CustomError } from "../../errors";
import { CustomerRepository } from "../../repositories";

interface CreateCustomerPhoneUseCase {
  execute(
    customerId: string,
    data: CreateCustomerPhoneDTO
  ): Promise<CustomerPhone>;
}

export class CreateCustomerPhone implements CreateCustomerPhoneUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(
    customerId: string,
    data: CreateCustomerPhoneDTO
  ): Promise<CustomerPhone> {
    const exist = await this.customerRepository.findPhoneByNumber(
      data.phoneNumber
    );
    if (exist)
      throw CustomError.conflict("El número de teléfono ya está en uso");

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw CustomError.notFound("El cliente no existe");

    if (data.isPrimary) {
      const phonesList = await this.customerRepository.listPhones(customerId);
      const primaryPhone = phonesList.find((phone) => phone.isPrimary);
      if (primaryPhone)
        throw CustomError.conflict(
          `El cliente ya tiene un teléfono primario: ${primaryPhone.phoneNumber}`
        );
    }

    return await this.customerRepository.createPhone(customerId, data);
  }
}
