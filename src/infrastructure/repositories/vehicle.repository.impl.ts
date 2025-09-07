import {
  RegisterVehicleDto,
  Vehicle,
  VehicleDatasource,
  VehicleRepository,
} from "../../domain";

export class VehicleRepositoryImpl implements VehicleRepository {
  constructor(private readonly vehicleDatasource: VehicleDatasource) {}

  createVehicle(data: RegisterVehicleDto): Promise<Vehicle> {
    return this.vehicleDatasource.createVehicle(data);
  }

  getVehicles({
    skip,
    limit,
    filters,
  }: {
    skip: number;
    limit: number;
    filters?: Partial<Vehicle>;
  }): Promise<{ vehicles: Vehicle[]; total: number }> {
    return this.vehicleDatasource.getVehicles(skip, limit, filters);
  }

  getVehicleById(id: string): Promise<Vehicle> {
    return this.vehicleDatasource.getVehicleById(id);
  }

  deleteVehicle(id: string): Promise<void> {
    return this.vehicleDatasource.deleteVehicle(id);
  }

  updateVehicle(id: string, data: RegisterVehicleDto): Promise<Vehicle> {
    return this.vehicleDatasource.updateVehicle(id, data);
  }

  findByChasis(chasis: string): Promise<Vehicle | null> {
    return this.vehicleDatasource.findByChasis(chasis);
  }

  findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.vehicleDatasource.findByLicensePlate(licensePlate);
  }

  findByCurrentTag(currentTag: string): Promise<Vehicle | null> {
    return this.vehicleDatasource.findByCurrentTag(currentTag);
  }
}
