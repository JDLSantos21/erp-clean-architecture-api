import {
  RegisterVehicleDto,
  CreateMaintenanceScheduleDto,
  ProcessMaintenanceDto,
  UpdateMaintenanceItemDto,
  VehicleQueryDto,
} from "../dtos";
import {
  VehicleMaintenance,
  VehicleMaintenanceItem,
  MaintenanceSchedule,
  Vehicle,
} from "../entities";
import { FilterParams } from "../types";

export abstract class VehicleDatasource {
  abstract createVehicle(data: RegisterVehicleDto): Promise<Vehicle>;
  abstract getVehicles(
    params: FilterParams<VehicleQueryDto>
  ): Promise<{ vehicles: Vehicle[]; total: number }>;
  abstract getVehicleById(id: string): Promise<Vehicle | null>;
  abstract updateVehicle(
    id: string,
    data: RegisterVehicleDto
  ): Promise<Vehicle>;
  abstract deleteVehicle(id: string): Promise<void>;
  abstract findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  abstract findByChasis(chasis: string): Promise<Vehicle | null>;
  abstract findByCurrentTag(currentTag: string): Promise<Vehicle | null>;

  // Mantenimientos de vehículos
  abstract createMaintenanceSchedule(
    data: CreateMaintenanceScheduleDto
  ): Promise<MaintenanceSchedule>;
  abstract getVehicleCurrentMileage(vehicleId: string): Promise<number | null>;
  abstract processMaintenanceCompletion(
    data: ProcessMaintenanceDto,
    userId: string
  ): Promise<VehicleMaintenance>;
  abstract getVehicleMaintenanceHistory(
    vehicleId: string
  ): Promise<VehicleMaintenance[]>;
  abstract getCurrentMaintenanceStatus(
    vehicleId: string
  ): Promise<VehicleMaintenance | null>;
  abstract updateMaintenanceItem(
    maintenanceId: string,
    procedureId: number,
    data: UpdateMaintenanceItemDto
  ): Promise<VehicleMaintenanceItem>;
  abstract getVehiclesNeedingMaintenance(): Promise<Vehicle[]>;
  abstract generateScheduledMaintenance(
    vehicleId: string
  ): Promise<VehicleMaintenance>;

  // Integración con sistema de combustible
  abstract updateVehicleMileageFromFuel(vehicleId: string): Promise<Vehicle>;
  abstract checkMaintenanceByMileage(vehicleId: string): Promise<boolean>;
  abstract getVehicleLastFuelConsumption(vehicleId: string): Promise<{
    mileage: number;
    consumedAt: Date;
  } | null>;
}
