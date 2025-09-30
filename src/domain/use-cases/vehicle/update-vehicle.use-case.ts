import { RegisterVehicleDto } from "../../dtos";
import { Vehicle } from "../../entities";
import { VehicleRepository } from "../../repositories";
import { VehicleService } from "../../services";

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
