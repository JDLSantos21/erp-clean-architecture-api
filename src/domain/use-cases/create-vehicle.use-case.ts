import { RegisterVehicleDto } from "../dtos";
import { Vehicle } from "../entities/Vehicle";
import { VehicleRepository } from "../repositories/vehicle.repository";
import { CustomError } from "../errors/custom.errors";

interface CreateVehicleUseCase {
  execute(createVehicleDto: RegisterVehicleDto): Promise<Vehicle>;
}

export class CreateVehicle implements CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(createVehicleDto: RegisterVehicleDto): Promise<Vehicle> {
    await this.validateLicensePlateExists(createVehicleDto.licensePlate);
    await this.validateChasisExists(createVehicleDto.chasis);
    await this.validateCurrentTagExists(createVehicleDto.currentTag);

    const errors: string[] = [];

    if (errors.length > 0) throw CustomError.badRequest(errors.join(", "));

    return this.vehicleRepository.createVehicle(createVehicleDto);
  }

  private async validateLicensePlateExists(
    licensePlate: string
  ): Promise<void> {
    const vehicle = await this.vehicleRepository.findByLicensePlate(
      licensePlate
    );
    if (vehicle) {
      throw CustomError.badRequest(
        `Vehicle license_plate '${licensePlate}' already exists`
      );
    }
  }

  private async validateChasisExists(chasis: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findByChasis(chasis);
    if (vehicle) {
      throw CustomError.badRequest(`Vehicle chasis '${chasis}' already exists`);
    }
  }

  private async validateCurrentTagExists(currentTag: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findByCurrentTag(currentTag);
    if (vehicle) {
      throw CustomError.badRequest(
        `Vehicle current_tag '${currentTag}' already exists`
      );
    }
  }
}
