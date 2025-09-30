import { Validators } from "../../../config";

export class UpdateCustomerDTO {
  private constructor(
    public businessName?: string,
    public representativeName?: string,
    public rnc?: string,
    public email?: string,
    public notes?: string
  ) {}

  static create(
    object: {
      [key: string]: any;
    },
    customerId: string
  ): [string?, UpdateCustomerDTO?] {
    if (!object) {
      return ["El cuerpo de la petición es requerido", undefined];
    }

    const { business_name, representative_name, rnc, email, notes } = object;

    if (!Validators.uuid.test(customerId))
      return ["El formato del ID de cliente no es válido", undefined];

    if (
      !Validators.hasAtLeastOneField({
        business_name,
        representative_name,
        rnc,
        email,
        notes,
      })
    )
      return ["Se requiere al menos un campo para actualizar", undefined];

    if (business_name && !Validators.isValidString(business_name))
      return ["El formato del nombre de la empresa no es válido", undefined];

    if (representative_name && !Validators.isValidString(representative_name))
      return [
        "El formato del nombre del representante no es válido",
        undefined,
      ];

    if (email && !Validators.email.test(email))
      return ["El formato del email no es válido", undefined];

    if (rnc && !Validators.rnc.test(rnc))
      return ["El formato del RNC no es válido", undefined];

    if (notes && !Validators.isValidString(notes))
      return ["El formato de las notas no es válido", undefined];

    return [
      undefined,
      new UpdateCustomerDTO(
        business_name,
        representative_name,
        rnc,
        email,
        notes
      ),
    ];
  }
}
