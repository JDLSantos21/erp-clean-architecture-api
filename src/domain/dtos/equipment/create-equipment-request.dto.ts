import { Validators } from "../../../config";
import { EQUIPMENT_TYPE } from "../../constants";
import { EquipmentType } from "../../entities";
import { IntegerId, PhoneNumber, UUID } from "../../value-object";

export class CreateEquipmentRequestDto {
  private constructor(
    public equipmentType: EquipmentType,
    public description: string,
    public contactName: string,
    public contactPhone: PhoneNumber,
    public requestedBy: UUID,
    public customerId?: UUID,
    public customerAddressId?: IntegerId,
    public equipmentModelId?: IntegerId,
    public contactEmail?: string,
    public companyName?: string,
    public businessType?: string,
    public address?: string,
    public notes?: string
  ) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, CreateEquipmentRequestDto?] {
    const {
      equipment_type,
      description,
      contact_name,
      contact_phone,
      requested_by,
      customer_id,
      customer_address_id,
      equipment_model_id,
      contact_email,
      company_name,
      business_type,
      address,
      notes,
    } = object;

    if (
      !equipment_type ||
      !description ||
      !contact_name ||
      !contact_phone ||
      !requested_by
    ) {
      return ["Faltan campos obligatorios"];
    }

    const equipmentType = EQUIPMENT_TYPE[equipment_type as EquipmentType];
    if (!equipmentType) return ["Tipo de equipo inválido"];

    if (!Validators.isValidString(description))
      return ["El formato de la descripción es inválido"];

    if (!Validators.isValidString(contact_name))
      return ["El formato del nombre de contacto es inválido"];

    if (contact_email && !Validators.email.test(contact_email))
      return ["El correo electrónico de contacto es inválido"];

    if (address && !Validators.isValidString(address)) {
      return ["El formato de la dirección es inválido"];
    }

    if (company_name && !Validators.isValidString(company_name)) {
      return ["El formato del nombre de la empresa es inválido"];
    }

    if (business_type && !Validators.isValidString(business_type)) {
      return ["El formato del tipo de negocio es inválido"];
    }

    if (notes && !Validators.isValidString(notes)) {
      return ["El formato de las notas es inválido"];
    }

    try {
      const contactPhone = PhoneNumber.create(contact_phone);
      const requestedBy = UUID.create(requested_by);
      const customerId = customer_id ? UUID.create(customer_id) : undefined;
      const customerAddressId =
        customer_address_id !== undefined
          ? IntegerId.create(customer_address_id)
          : undefined;
      const equipmentModelId =
        equipment_model_id !== undefined
          ? IntegerId.create(equipment_model_id)
          : undefined;

      return [
        undefined,
        new CreateEquipmentRequestDto(
          equipmentType,
          description.trim(),
          contact_name.trim(),
          contactPhone,
          requestedBy,
          customerId,
          customerAddressId,
          equipmentModelId,
          contact_email ? contact_email.trim() : undefined,
          company_name ? company_name.trim() : undefined,
          business_type ? business_type.trim() : undefined,
          address ? address.trim() : undefined,
          notes ? notes.trim() : undefined
        ),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
