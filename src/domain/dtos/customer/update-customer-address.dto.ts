import { Validators } from "../../../config";

export class UpdateCustomerAddressDTO {
  private constructor(
    public direction?: string,
    public city?: string,
    public latitude?: number,
    public longitude?: number,
    public branchName?: string
  ) {}

  static create(
    object: {
      [key: string]: any;
    },
    addressId: number
  ): [string?, UpdateCustomerAddressDTO?] {
    const { direction, city, latitude, longitude, branch_name } = object;

    if (
      !Validators.hasAtLeastOneField({
        direction,
        city,
        latitude,
        longitude,
        branch_name,
      })
    ) {
      return ["Se requiere al menos un campo para actualizar la dirección"];
    }

    if (!Validators.isPositiveInteger(addressId))
      return ["El ID de dirección no es válido"];
    if (direction && !Validators.isValidString(direction))
      return ["El formato de la dirección no es válido"];
    if (city && !Validators.isValidString(city))
      return ["El formato de la ciudad no es válido"];
    if (branch_name && !Validators.isValidString(branch_name))
      return ["El formato del nombre de la sucursal no es válido"];
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
      new UpdateCustomerAddressDTO(
        direction,
        city,
        latitude,
        longitude,
        branch_name
      ),
    ];
  }
}
