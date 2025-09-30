import {
  CreateFuelConsumptionDto,
  CreateFuelTankRefillDto,
  CreateUpdateFuelTankDto,
  FuelConsumptionQueryDto,
  FuelTankRefillQueryDto,
  UpdateFuelConsumptionDto,
} from "../dtos";
import { CreateFuelTankDto } from "../dtos/fuel/create-fuel-tank.dto";
import { UpdateFuelTankDto } from "../dtos/fuel/update-fuel-tank.dto";
import {
  FuelConsumption,
  FuelRefill,
  FuelTank,
  FuelTankReset,
} from "../entities";
import { FilterParams } from "../types";

export abstract class FuelRepository {
  abstract createFuelConsumption(
    data: CreateFuelConsumptionDto
  ): Promise<FuelConsumption>;

  abstract findAllFuelConsumptions(
    params: FilterParams<FuelConsumptionQueryDto>
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

  abstract getFuelTankRefillById(
    id: number,
    consumptions?: boolean
  ): Promise<FuelRefill | null>;
  abstract deleteFuelTankRefill(id: number): Promise<void>;

  abstract getTankCurrentStatus(): Promise<FuelTank | null>;

  abstract findVehicleLastConsumptionExcluding(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null>;

  abstract findVehicleNextConsumption(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null>;

  abstract resetFuelTankLevel(userId: string): Promise<FuelTankReset | null>;

  abstract createOrUpdateFuelTankLevel(
    params: CreateUpdateFuelTankDto
  ): Promise<FuelTank>;

  abstract createFuelTank(params: CreateFuelTankDto): Promise<FuelTank>;

  abstract updateFuelTank(
    id: number,
    params: UpdateFuelTankDto
  ): Promise<FuelTank | null>;

  abstract findVehicleLastConsumption(
    vehicleId: string
  ): Promise<FuelConsumption | null>;

  abstract findLastTankRefill(): Promise<FuelRefill | null>;

  abstract findAllTankRefills(
    params: FilterParams<FuelTankRefillQueryDto>
  ): Promise<{ refills: FuelRefill[]; totalPages: number }>;
}
