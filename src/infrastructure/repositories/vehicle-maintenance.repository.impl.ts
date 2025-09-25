import {
  VehicleMaintenanceRepository,
  VehicleMaintenanceDatasource,
  CreateMaintenanceProcedureDto,
  MaintenanceReportDto,
  CreateMaintenanceDto,
  MaintenanceQueryDto,
  MaintenanceProcedure,
  VehicleMaintenance,
  MaintenanceAlert,
  MaintenanceSchedule,
} from "../../domain";

export class VehicleMaintenanceRepositoryImpl extends VehicleMaintenanceRepository {
  constructor(private readonly datasource: VehicleMaintenanceDatasource) {
    super();
  }

  // Procedimientos de Mantenimiento
  async createMaintenanceProcedure(
    data: CreateMaintenanceProcedureDto
  ): Promise<MaintenanceProcedure> {
    return await this.datasource.createMaintenanceProcedure(data);
  }

  async getMaintenanceProcedures(): Promise<MaintenanceProcedure[]> {
    return await this.datasource.getMaintenanceProcedures();
  }

  async updateMaintenanceProcedure(
    id: number,
    data: Partial<CreateMaintenanceProcedureDto>
  ): Promise<MaintenanceProcedure> {
    return await this.datasource.updateMaintenanceProcedure(id, data);
  }

  async deleteMaintenanceProcedure(id: number): Promise<void> {
    return await this.datasource.deleteMaintenanceProcedure(id);
  }

  // Gestión de Mantenimientos
  async createMaintenance(
    data: CreateMaintenanceDto
  ): Promise<VehicleMaintenance> {
    return await this.datasource.createMaintenance(data);
  }

  async getMaintenances(filters: MaintenanceQueryDto): Promise<{
    maintenances: VehicleMaintenance[];
    total: number;
  }> {
    return await this.datasource.getMaintenances(filters);
  }

  async getMaintenanceById(id: string): Promise<VehicleMaintenance | null> {
    return await this.datasource.getMaintenanceById(id);
  }

  async updateMaintenanceStatus(
    id: string,
    status:
      | "PROGRAMADO"
      | "EN_PROGRESO"
      | "COMPLETADO"
      | "CANCELADO"
      | "VENCIDO"
      | "PARCIAL"
  ): Promise<VehicleMaintenance> {
    return await this.datasource.updateMaintenanceStatus(id, status);
  }

  async deleteMaintenance(id: string): Promise<void> {
    return await this.datasource.deleteMaintenance(id);
  }

  // Sistema de Alertas Automáticas
  async generateMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    return await this.datasource.generateMaintenanceAlerts();
  }

  async getMaintenanceAlerts(
    vehicleId?: string,
    priority?: "BAJO" | "MEDIO" | "ALTO" | "CRITICO"
  ): Promise<MaintenanceAlert[]> {
    return await this.datasource.getMaintenanceAlerts(vehicleId, priority);
  }

  async markAlertAsRead(alertId: string): Promise<MaintenanceAlert> {
    return await this.datasource.markAlertAsRead(alertId);
  }

  async dismissAlert(alertId: string): Promise<void> {
    return await this.datasource.dismissAlert(alertId);
  }

  // Reportes y Análisis
  async getMaintenanceReport(filters: MaintenanceReportDto): Promise<any> {
    return await this.datasource.getMaintenanceReport(filters);
  }

  async getMaintenanceCostAnalysis(dateFrom: Date, dateTo: Date): Promise<any> {
    return await this.datasource.getMaintenanceCostAnalysis(dateFrom, dateTo);
  }

  async getVehicleMaintenanceEfficiency(vehicleId?: string): Promise<any> {
    return await this.datasource.getVehicleMaintenanceEfficiency(vehicleId);
  }

  async getIncompleteMaintenanceReport(): Promise<VehicleMaintenance[]> {
    return await this.datasource.getIncompleteMaintenanceReport();
  }

  async getOverdueMaintenances(): Promise<VehicleMaintenance[]> {
    return await this.datasource.getOverdueMaintenances();
  }

  async getUpcomingMaintenances(days: number): Promise<VehicleMaintenance[]> {
    return await this.datasource.getUpcomingMaintenances(days);
  }

  // Automatización
  async checkAndCreateScheduledMaintenances(): Promise<VehicleMaintenance[]> {
    return await this.datasource.checkAndCreateScheduledMaintenances();
  }

  async calculateNextMaintenanceDate(
    vehicleId: string
  ): Promise<{ nextDate: Date; nextMileage?: number }> {
    return await this.datasource.calculateNextMaintenanceDate(vehicleId);
  }

  async getVehicleLastMaintenanceDate(vehicleId: string): Promise<Date | null> {
    return await this.datasource.getVehicleLastMaintenanceDate(vehicleId);
  }

  async getVehicleMaintenanceSchedule(
    vehicleId: string
  ): Promise<MaintenanceSchedule | null> {
    return await this.datasource.getVehicleMaintenanceSchedule(vehicleId);
  }
}
