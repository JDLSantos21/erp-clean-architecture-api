import { Validators } from "../../../config";
import { CreateCustomerPhoneDTO, CreateCustomerAddressDTO } from "../../dtos";

export class RegisterCustomerDTO {
  private constructor(
    public businessName: string,
    public representativeName: string,
    public phones: CreateCustomerPhoneDTO[],
    public addresses: CreateCustomerAddressDTO[],
    public email?: string,
    public rnc?: string,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, RegisterCustomerDTO?] {
    const {
      business_name,
      representative_name,
      rnc,
      email,
      phones,
      addresses,
      notes,
    } = object;

    if (!Validators.isValidString(business_name))
      return ["El formato del nombre de la empresa no es válido"];

    if (!Validators.isValidString(representative_name))
      return ["El formato del nombre del representante no es válido"];

    if (email && !Validators.email.test(email))
      return ["El formato del email no es válido"];

    if (rnc && !Validators.rnc.test(rnc))
      if (!addresses || addresses.length === 0)
        return ["Se requiere al menos una dirección"];

    if (!phones || phones.length === 0)
      return ["Se requiere al menos un teléfono"];

    const valid_phones: CreateCustomerPhoneDTO[] = [];

    for (const phone of phones) {
      const [error, phoneDTO] = CreateCustomerPhoneDTO.create(phone);
      if (error) return [error];
      valid_phones.push(phoneDTO!);
    }

    const valid_addresses: CreateCustomerAddressDTO[] = [];

    for (const address of addresses) {
      const [error, addressDTO] = CreateCustomerAddressDTO.create(address);
      if (error) return [error];
      valid_addresses.push(addressDTO!);
    }

    if (notes && notes.length > 100)
      return ["La nota debe tener un máximo de 100 caracteres"];

    return [
      undefined,
      new RegisterCustomerDTO(
        business_name.trim(),
        representative_name.trim(),
        valid_phones,
        valid_addresses,
        email,
        rnc,
        notes?.trim()
      ),
    ];
  }
}
