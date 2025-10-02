import { CreateFuelConsumptionDto } from "../../dtos";
import { FuelConsumption, FuelTank } from "../../entities";
import { CustomError } from "../../errors";
import {
  FuelRepository,
  VehicleRepository,
  EmployeeRepository,
} from "../../repositories";

interface CreateFuelConsumptionUseCase {
  execute(data: CreateFuelConsumptionDto): Promise<FuelConsumption>;
}

export class CreateFuelConsumption implements CreateFuelConsumptionUseCase {
  constructor(
    private readonly fuelRepository: FuelRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly employeeRepository: EmployeeRepository
  ) {}

  async execute(data: CreateFuelConsumptionDto): Promise<FuelConsumption> {
    const { vehicleId, mileage, tankRefillId, gallons, driverId } = data;

    const [fuelTank, vehicle, driver, explicitTankRefill] = await Promise.all([
      this.fuelRepository.getTankCurrentStatus(),
      this.vehicleRepository.getVehicleById(vehicleId),
      driverId
        ? this.employeeRepository.findById(driverId)
        : Promise.resolve(null),
      tankRefillId
        ? this.fuelRepository.getFuelTankRefillById(tankRefillId)
        : Promise.resolve(null),
    ]);

    this.validateAttributes({
      fuelTank,
      gallons,
      driver,
      vehicle,
      driverId,
      tankRefillId,
      explicitTankRefill,
    });

    // 2. Obtener último consumo y último refill (si hace falta) en paralelo.
    const [vehicleLastConsumption, lastTankRefill] = await Promise.all([
      this.fuelRepository.findVehicleLastConsumption(vehicleId),
      tankRefillId
        ? Promise.resolve(null)
        : this.fuelRepository.findLastTankRefill(),
    ]);

    const finalTankRefillId = tankRefillId ?? lastTankRefill?.id ?? undefined;

    const payload = {
      ...data,
      tankRefillId: finalTankRefillId,
    };

    this.validateMileage(mileage, vehicleLastConsumption?.mileage);

    if (data.consumedAt !== undefined && vehicleLastConsumption) {
      if (data.consumedAt <= vehicleLastConsumption.consumedAt) {
        throw CustomError.badRequest(
          "La fecha de consumo no puede ser menor o igual a la fecha del último registro"
        );
      }
    }

    const createdConsumption = await this.fuelRepository.createFuelConsumption(
      payload
    );

    return createdConsumption;
  }

  private validateAttributes(params: {
    fuelTank: FuelTank | null;
    vehicle: any;
    driver: any;
    driverId?: string | null;
    gallons: number;
    tankRefillId?: number;
    explicitTankRefill?: any;
  }) {
    const {
      fuelTank,
      gallons,
      vehicle,
      driverId,
      explicitTankRefill,
      tankRefillId,
      driver,
    } = params;
    if (tankRefillId && !explicitTankRefill) {
      throw CustomError.badRequest(
        "El reabastecimiento de combustible no existe"
      );
    }

    if (!fuelTank) {
      throw CustomError.badRequest(
        "No se puede registrar el consumo de combustible sin un tanque de combustible"
      );
    }

    if (Math.round(fuelTank.currentLevel) === 0) {
      throw CustomError.badRequest(
        "No se puede registrar el consumo de combustible con el tanque vacío"
      );
    }

    if (fuelTank.currentLevel < gallons) {
      throw CustomError.badRequest(
        "No se puede registrar un consumo que exceda el nivel actual del tanque"
      );
    }

    if (driverId && !driver) {
      throw CustomError.badRequest("El conductor no existe");
    }

    if (!vehicle) {
      throw CustomError.badRequest("El vehículo no existe");
    }
  }

  private validateMileage(
    currentMileage?: number | null,
    lastMileage?: number | null
  ) {
    if (currentMileage == null || lastMileage == null) return;

    if (currentMileage <= lastMileage) {
      throw CustomError.badRequest(
        "El kilometraje de combustible no puede ser menor o igual al último registro"
      );
    }

    const diff = currentMileage - lastMileage;

    if (diff > 500) {
      throw CustomError.badRequest(
        "La diferencia de kilometraje no puede ser mayor a 500 km"
      );
    }
  }
}
