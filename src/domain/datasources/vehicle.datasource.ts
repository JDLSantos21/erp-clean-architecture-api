import { RegisterVehicleDto } from "../dtos";
import { Vehicle } from "../entities/Vehicle";

export abstract class VehicleDatasource {
  abstract createVehicle(data: RegisterVehicleDto): Promise<Vehicle>;
  abstract getVehicles(
    skip: number,
    limit: number,
    filters?: Partial<Vehicle>
  ): Promise<{ vehicles: Vehicle[]; total: number }>;
  abstract getVehicleById(id: string): Promise<Vehicle>;
  abstract updateVehicle(
    id: string,
    data: RegisterVehicleDto
  ): Promise<Vehicle>;
  abstract deleteVehicle(id: string): Promise<void>;
  abstract findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  abstract findByChasis(chasis: string): Promise<Vehicle | null>;
  abstract findByCurrentTag(currentTag: string): Promise<Vehicle | null>;
}
