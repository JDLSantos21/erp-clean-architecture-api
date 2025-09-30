import { RegisterVehicleDto } from "../dtos";
import { Vehicle } from "../entities/vehicle/Vehicle";
import { VehicleRepository } from "../repositories/vehicle.repository";
import { VehicleService } from "../services/vehicle.service";

interface UpdateVehicleUseCase {
  execute(id: string, updateVehicleDto: RegisterVehicleDto): Promise<Vehicle>;
}

export class UpdateVehicle implements UpdateVehicleUseCase {
  private readonly vehicleService: VehicleService;

  constructor(private readonly vehicleRepository: VehicleRepository) {
    this.vehicleService = new VehicleService(vehicleRepository);
  }

  async execute(
    id: string,
    updateVehicleDto: RegisterVehicleDto
  ): Promise<Vehicle> {
    await this.vehicleService.validateVehicleExists(id);
    await this.vehicleService.validateUniqueConstraints(updateVehicleDto, id);

    return this.vehicleRepository.updateVehicle(id, updateVehicleDto);
  }
}
