import { Validators } from "../../../config";
import { PhoneTypes } from "../../constants/customer.constants";
import { PhoneType } from "../../entities";
import { CustomError } from "../../errors/custom.errors";

export class UpdateCustomerPhoneDto {
  private constructor(
    public phoneNumber?: string,
    public description?: string,
    public isPrimary?: boolean,
    public type?: PhoneType,
    public hasWhatsapp?: boolean
  ) {}

  static create(
    object: {
      [key: string]: any;
    },
    phoneId: number
  ): [string?, UpdateCustomerPhoneDto?] {
    const { phone_number, description, is_primary, type, has_whatsapp } =
      object;

    if (
      !Validators.hasAtLeastOneField({
        phone_number,
        description,
        is_primary,
        type,
        has_whatsapp,
      })
    ) {
      throw CustomError.badRequest(
        "Se requiere al menos un campo para actualizar el teléfono"
      );
    }

    if (!Validators.isPositiveInteger(phoneId))
      return ["El ID de teléfono no es válido"];

    if (phone_number && typeof phone_number !== "string")
      return ["El número de teléfono debe ser un string"];

    if (phone_number && !Validators.phoneNumber.test(phone_number))
      return ["El formato del número de teléfono no es válido"];

    if (description && !Validators.isValidString(description))
      return ["El formato de la descripción no es válido"];

    if (is_primary && !Validators.isBoolean(is_primary))
      return ["Se debe especificar si el teléfono es primario"];

    if (type && !(type in PhoneTypes))
      return ["El formato del tipo de teléfono no es válido"];

    if (has_whatsapp && !Validators.isBoolean(has_whatsapp))
      return ["Se debe especificar si el teléfono tiene WhatsApp"];

    return [
      undefined,
      new UpdateCustomerPhoneDto(
        phone_number,
        description,
        is_primary,
        type,
        has_whatsapp
      ),
    ];
  }
}
