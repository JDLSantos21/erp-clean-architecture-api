import {
  RegisterVehicleDto,
  Vehicle,
  VehicleDatasource,
  VehicleRepository,
  CreateMaintenanceScheduleDto,
  ProcessMaintenanceDto,
  UpdateMaintenanceItemDto,
  VehicleMaintenance,
  VehicleMaintenanceItem,
  MaintenanceSchedule,
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

  getVehicleById(id: string): Promise<Vehicle | null> {
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

  // Mantenimientos de vehículos
  createMaintenanceSchedule(
    data: CreateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule> {
    return this.vehicleDatasource.createMaintenanceSchedule(data);
  }

  getVehicleCurrentMileage(vehicleId: string): Promise<number | null> {
    return this.vehicleDatasource.getVehicleCurrentMileage(vehicleId);
  }

  processMaintenanceCompletion(
    data: ProcessMaintenanceDto,
    userId: string
  ): Promise<VehicleMaintenance> {
    return this.vehicleDatasource.processMaintenanceCompletion(data, userId);
  }

  getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<VehicleMaintenance[]> {
    return this.vehicleDatasource.getVehicleMaintenanceHistory(vehicleId);
  }

  getCurrentMaintenanceStatus(
    vehicleId: string
  ): Promise<VehicleMaintenance | null> {
    return this.vehicleDatasource.getCurrentMaintenanceStatus(vehicleId);
  }

  updateMaintenanceItem(
    maintenanceId: string,
    procedureId: number,
    data: UpdateMaintenanceItemDto
  ): Promise<VehicleMaintenanceItem> {
    return this.vehicleDatasource.updateMaintenanceItem(
      maintenanceId,
      procedureId,
      data
    );
  }

  getVehiclesNeedingMaintenance(): Promise<Vehicle[]> {
    return this.vehicleDatasource.getVehiclesNeedingMaintenance();
  }

  generateScheduledMaintenance(vehicleId: string): Promise<VehicleMaintenance> {
    return this.vehicleDatasource.generateScheduledMaintenance(vehicleId);
  }

  // Integración con sistema de combustible
  updateVehicleMileageFromFuel(vehicleId: string): Promise<Vehicle> {
    return this.vehicleDatasource.updateVehicleMileageFromFuel(vehicleId);
  }

  checkMaintenanceByMileage(vehicleId: string): Promise<boolean> {
    return this.vehicleDatasource.checkMaintenanceByMileage(vehicleId);
  }

  getVehicleLastFuelConsumption(vehicleId: string): Promise<{
    mileage: number;
    consumedAt: Date;
  } | null> {
    return this.vehicleDatasource.getVehicleLastFuelConsumption(vehicleId);
  }
}
