import {
  CreateFuelConsumptionDto,
  CreateFuelTankDto,
  CreateFuelTankRefillDto,
  CreateUpdateFuelTankDto,
  FuelConsumption,
  FuelDatasource,
  FuelRefill,
  FuelRepository,
  FuelTank,
  FuelTankReset,
  UpdateFuelConsumptionDto,
  UpdateFuelTankDto,
} from "../../domain";

interface FiltersParams {
  filters?: Partial<FuelConsumption>;
  skip?: number;
  limit?: number;
}

export class FuelRepositoryImpl implements FuelRepository {
  constructor(private readonly fuelDatasource: FuelDatasource) {}

  createFuelConsumption(
    data: CreateFuelConsumptionDto
  ): Promise<FuelConsumption> {
    return this.fuelDatasource.createFuelConsumption(data);
  }

  deleteFuelConsumption(id: number): Promise<void> {
    return this.fuelDatasource.deleteFuelConsumption(id);
  }

  updateFuelConsumption(
    id: number,
    data: UpdateFuelConsumptionDto
  ): Promise<FuelConsumption | null> {
    return this.fuelDatasource.updateFuelConsumption(id, data);
  }

  findFuelConsumptionById(id: number): Promise<FuelConsumption | null> {
    return this.fuelDatasource.findFuelConsumptionById(id);
  }

  findVehicleLastConsumption(
    vehicleId: string
  ): Promise<FuelConsumption | null> {
    return this.fuelDatasource.findVehicleLastConsumption(vehicleId);
  }

  findVehicleLastConsumptionExcluding(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null> {
    return this.fuelDatasource.findVehicleLastConsumptionExcluding(
      vehicleId,
      consumptionId
    );
  }

  findVehicleNextConsumption(
    vehicleId: string,
    consumptionId: number
  ): Promise<FuelConsumption | null> {
    return this.fuelDatasource.findVehicleNextConsumption(
      vehicleId,
      consumptionId
    );
  }

  getTankCurrentStatus(): Promise<FuelTank | null> {
    return this.fuelDatasource.getTankCurrentStatus();
  }

  resetFuelTankLevel(userId: string): Promise<FuelTankReset | null> {
    return this.fuelDatasource.resetFuelTankLevel(userId);
  }

  findAllFuelConsumptions(
    params: FiltersParams
  ): Promise<{ consumptions: FuelConsumption[]; totalPages: number }> {
    return this.fuelDatasource.findAllFuelConsumptions(params);
  }

  findAllTankRefills(
    params: FiltersParams
  ): Promise<{ refills: FuelRefill[]; totalPages: number }> {
    return this.fuelDatasource.findAllTankRefills(params);
  }

  createFuelTankRefill(data: CreateFuelTankRefillDto): Promise<FuelRefill> {
    return this.fuelDatasource.createFuelTankRefill(data);
  }

  deleteFuelTankRefill(id: number): Promise<void> {
    return this.fuelDatasource.deleteFuelTankRefill(id);
  }

  getFuelTankRefillById(
    id: number,
    consumptions?: boolean
  ): Promise<FuelRefill | null> {
    return this.fuelDatasource.getFuelTankRefillById(id, consumptions);
  }

  findLastTankRefill(): Promise<FuelRefill | null> {
    return this.fuelDatasource.findLastTankRefill();
  }

  async createFuelTank(params: CreateFuelTankDto): Promise<FuelTank> {
    return this.fuelDatasource.createFuelTank(params);
  }

  async updateFuelTank(
    id: number,
    params: UpdateFuelTankDto
  ): Promise<FuelTank | null> {
    return this.fuelDatasource.updateFuelTank(id, params);
  }

  createOrUpdateFuelTankLevel(
    params: CreateUpdateFuelTankDto
  ): Promise<FuelTank> {
    return this.fuelDatasource.createOrUpdateFuelTankLevel(params);
  }
}
