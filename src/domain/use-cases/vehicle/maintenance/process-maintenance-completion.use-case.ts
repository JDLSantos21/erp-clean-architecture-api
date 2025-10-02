import { ProcessMaintenanceDto } from "../../../dtos";
import { VehicleRepository } from "../../../repositories";
import { VehicleMaintenance } from "../../../entities";

interface ProcessMaintenanceCompletionUseCase {
  execute(
    data: ProcessMaintenanceDto,
    userId: string
  ): Promise<VehicleMaintenance>;
}

export class ProcessMaintenanceCompletion
  implements ProcessMaintenanceCompletionUseCase
{
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(
    data: ProcessMaintenanceDto,
    userId: string
  ): Promise<VehicleMaintenance> {
    // 1. Obtener el kilometraje actual automáticamente desde el último consumo de combustible
    const currentMileage =
      await this.vehicleRepository.getVehicleCurrentMileage(data.vehicleId);

    // 2. Procesar el mantenimiento con el kilometraje obtenido automáticamente
    const maintenance =
      await this.vehicleRepository.processMaintenanceCompletion(data, userId);

    // 3. Actualizar el kilometraje del vehículo desde el sistema de combustible
    await this.vehicleRepository.updateVehicleMileageFromFuel(data.vehicleId);

    // 4. Verificar si necesita programar próximo mantenimiento por kilometraje
    const needsMaintenanceByMileage =
      await this.vehicleRepository.checkMaintenanceByMileage(data.vehicleId);

    if (needsMaintenanceByMileage) {
      // Programar siguiente mantenimiento automáticamente
      await this.vehicleRepository.generateScheduledMaintenance(data.vehicleId);
    }

    return maintenance;
  }
}
