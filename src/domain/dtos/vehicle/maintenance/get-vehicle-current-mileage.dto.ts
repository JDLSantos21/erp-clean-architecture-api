import { Validators } from "../../../../config";

export class GetVehicleCurrentMileageDto {
  constructor(public vehicleId: string) {}

  static create(object: {
    [key: string]: any;
  }): [string?, GetVehicleCurrentMileageDto?] {
    const { vehicle_id } = object;

    if (!vehicle_id) {
      return ["El ID del vehículo es requerido", undefined];
    }

    if (!Validators.uuid.test(vehicle_id)) {
      return ["El ID del vehículo no es válido", undefined];
    }

    return [undefined, new GetVehicleCurrentMileageDto(vehicle_id)];
  }
}
