import { Validators } from "../../../config";
import { PhoneTypes } from "../../constants";
import { PhoneType } from "../../entities";

export class CreateCustomerPhoneDTO {
  private constructor(
    public phoneNumber: string,
    public type: PhoneType,
    public hasWhatsapp: boolean,
    public isPrimary: boolean
  ) {}
  static create(
    object: {
      [key: string]: any;
    },
    customerId?: string
  ): [string?, CreateCustomerPhoneDTO?] {
    const { phone_number, type, has_whatsapp, is_primary } = object;

    if (
      has_whatsapp === undefined ||
      is_primary === undefined ||
      phone_number === undefined ||
      type === undefined
    )
      return ["Todos los campos son obligatorios"];

    if (customerId && !Validators.uuid.test(customerId))
      return ["El formato del ID de cliente no es válido"];

    if (typeof phone_number !== "string") {
      return ["El número de teléfono debe ser un string"];
    }

    if (!Validators.phoneNumber.test(phone_number))
      return ["El formato del número de teléfono no es válido"];

    if (!type || !(type in PhoneTypes))
      return ["El tipo de teléfono no es válido"];

    if (!Validators.isBoolean(has_whatsapp))
      return ["El formato de whatsapp no es válido"];

    if (!Validators.isBoolean(is_primary))
      return ["El formato del tipo de teléfono no es válido"];

    return [
      undefined,
      new CreateCustomerPhoneDTO(phone_number, type, has_whatsapp, is_primary),
    ];
  }
}
