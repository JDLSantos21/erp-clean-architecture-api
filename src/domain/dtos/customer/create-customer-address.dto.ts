import { Validators } from "../../../config";

export class CreateCustomerAddressDTO {
  private constructor(
    public direction: string,
    public city: string,
    public isPrimary: boolean,
    public isActive: boolean = true,
    public latitude?: number,
    public longitude?: number,
    public branchName?: string
  ) {}
  static create(
    object: {
      [key: string]: any;
    },
    customerId?: string
  ): [string?, CreateCustomerAddressDTO?] {
    const {
      direction,
      city,
      is_primary,
      is_active,
      branch_name,
      latitude,
      longitude,
    } = object;

    if (customerId && !Validators.uuid.test(customerId))
      return ["El formato del ID de cliente no es válido"];

    if (!Validators.isValidString(direction))
      return ["La dirección es requerida"];

    if (!Validators.isValidString(city)) return ["La ciudad es requerida"];

    if (branch_name && !Validators.isValidString(branch_name))
      return ["El nombre de la sucursal no es válido"];

    if (!Validators.isBoolean(is_primary))
      return ["Se debe especificar si la dirección es primaria"];

    if (is_active && !Validators.isBoolean(is_active))
      return ["Se debe especificar si la dirección está activa"];

    if (latitude !== undefined && longitude === undefined)
      return ["Se debe proporcionar la longitud si se proporciona la latitud"];

    if (longitude !== undefined && latitude === undefined)
      return ["Se debe proporcionar la latitud si se proporciona la longitud"];

    if (latitude && longitude) {
      if (!Validators.validateCoordinates(latitude, longitude))
        return ["Las coordenadas no son válidas"];
    }

    return [
      undefined,
      new CreateCustomerAddressDTO(
        direction,
        city,
        is_primary,
        is_active,
        latitude,
        longitude,
        branch_name
      ),
    ];
  }
}
