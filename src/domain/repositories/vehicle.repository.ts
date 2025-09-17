import { RegisterVehicleDto } from "../dtos";
import { Vehicle } from "../entities/Vehicle";

interface getVehiclesParams {
  filters?: Partial<Vehicle>;
  limit: number;
  skip: number;
}

export abstract class VehicleRepository {
  abstract createVehicle(data: RegisterVehicleDto): Promise<Vehicle>;
  abstract getVehicles({
    filters,
    skip,
    limit,
  }: getVehiclesParams): Promise<{ vehicles: Vehicle[]; total: number }>;
  abstract getVehicleById(id: string): Promise<Vehicle | null>;
  abstract updateVehicle(
    id: string,
    data: RegisterVehicleDto
  ): Promise<Vehicle>;
  abstract deleteVehicle(id: string): Promise<void>;
  abstract findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  abstract findByChasis(chasis: string): Promise<Vehicle | null>;
  abstract findByCurrentTag(currentTag: string): Promise<Vehicle | null>;
}
