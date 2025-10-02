import { VehicleMaintenanceRepository } from "../../../repositories";
import { MaintenanceAlert } from "../../../entities";

interface GenerateMaintenanceAlertsUseCase {
  execute(): Promise<MaintenanceAlert[]>;
}

export class GenerateMaintenanceAlerts
  implements GenerateMaintenanceAlertsUseCase
{
  constructor(
    private readonly vehicleMaintenanceRepository: VehicleMaintenanceRepository
  ) {}

  async execute(): Promise<MaintenanceAlert[]> {
    // Generar alertas automáticas para todos los vehículos
    const alerts =
      await this.vehicleMaintenanceRepository.generateMaintenanceAlerts();

    // Opcional: agregar lógica para enviar notificaciones
    // por email, push notifications, etc.

    return alerts;
  }
}
