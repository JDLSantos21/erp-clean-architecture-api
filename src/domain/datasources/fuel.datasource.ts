import {
  CreateFuelConsumptionDto,
  CreateFuelTankRefillDto,
  CreateUpdateFuelTankDto,
  UpdateFuelConsumptionDto,
} from "../dtos";
import { CreateFuelTankDto } from "../dtos/fuel/create-fuel-tank.dto";
import { UpdateFuelTankDto } from "../dtos/fuel/update-fuel-tank.dto";
import {
  FuelConsumption,
  FuelRefill,
  FuelTank,
  FuelTankReset,
} from "../entities/Fuel";

interface FiltersParams {
  filters?: Partial<FuelConsumption>;
  skip?: number;
  limit?: number;
}

export abstract class FuelDatasource {
  abstract createFuelConsumption(
    data: CreateFuelConsumptionDto
  ): Promise<FuelConsumption>;

  abstract findAllFuelConsumptions(
    params: FiltersParams
  ): Promise<{ consumptions: FuelConsumption[]; totalPages: number }>;

  abstract findFuelConsumptionById(id: number): Promise<FuelConsumption | null>;

  abstract updateFuelConsumption(
    id: number,
    data: UpdateFuelConsumptionDto
  ): Promise<FuelConsumption | null>;
  abstract deleteFuelConsumption(id: number): Promise<void>;

  abstract createFuelTankRefill(
    data: CreateFuelTankRefillDto
  ): Promise<FuelRefill>;

  abstract getFuelTankRefills(
    params: FiltersParams
  ): Promise<{ refills: FuelRefill[]; totalPages: number }>;

  abstract getFuelTankRefillById(id: number): Promise<FuelRefill | null>;
  abstract deleteFuelTankRefill(id: number): Promise<void>;

  abstract getCurrentFuelTankStatus(): Promise<FuelTank | null>;

  abstract resetFuelTankLevel(
    previousLevel: number,
    userId: string
  ): Promise<FuelTankReset | null>;

  abstract createFuelTank(params: CreateFuelTankDto): Promise<FuelTank>;

  abstract updateFuelTank(
    id: number,
    params: UpdateFuelTankDto
  ): Promise<FuelTank | null>;

  abstract createOrUpdateFuelTankLevel(
    params: CreateUpdateFuelTankDto
  ): Promise<FuelTank>;

  abstract findVehicleLastConsumption(
    vehicleId: string
  ): Promise<FuelConsumption | null>;

  abstract findVehicleLastConsumptionExcluding(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null>;

  abstract findVehicleNextConsumption(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null>;

  abstract findLastTankRefill(): Promise<FuelRefill | null>;
}
