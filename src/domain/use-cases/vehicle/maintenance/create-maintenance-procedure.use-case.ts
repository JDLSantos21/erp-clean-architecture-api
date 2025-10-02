import { CreateMaintenanceProcedureDto } from "../../../dtos";
import { VehicleMaintenanceRepository } from "../../../repositories";
import { MaintenanceProcedure } from "../../../entities";

interface CreateMaintenanceProcedureUseCase {
  execute(data: CreateMaintenanceProcedureDto): Promise<MaintenanceProcedure>;
}

export class CreateMaintenanceProcedure
  implements CreateMaintenanceProcedureUseCase
{
  constructor(
    private readonly vehicleMaintenanceRepository: VehicleMaintenanceRepository
  ) {}

  async execute(
    data: CreateMaintenanceProcedureDto
  ): Promise<MaintenanceProcedure> {
    return await this.vehicleMaintenanceRepository.createMaintenanceProcedure(
      data
    );
  }
}
