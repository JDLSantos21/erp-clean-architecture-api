import { UpdateCustomerPhoneDto } from "../../dtos";
import { CustomerPhone } from "../../entities";
import { CustomerRepository } from "../../repositories";
import { CustomError } from "../../errors";

interface UpdateCustomerPhoneUseCase {
  execute(
    phoneId: number,
    data: UpdateCustomerPhoneDto
  ): Promise<CustomerPhone>;
}

export class UpdateCustomerPhone implements UpdateCustomerPhoneUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(
    phoneId: number,
    data: UpdateCustomerPhoneDto
  ): Promise<CustomerPhone> {
    const phone = await this.customerRepository.findPhoneById(phoneId);
    if (!phone) throw CustomError.notFound("El teléfono no existe");

    if (data.phoneNumber && data.phoneNumber !== phone.phoneNumber) {
      const exist = await this.customerRepository.findPhoneByNumber(
        data.phoneNumber
      );

      if (exist)
        throw CustomError.conflict("El número de teléfono ya está en uso");
    }

    return await this.customerRepository.updatePhone(phoneId, data);
  }
}
