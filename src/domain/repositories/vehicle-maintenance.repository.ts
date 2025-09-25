import {
  CreateMaintenanceProcedureDto,
  MaintenanceReportDto,
  CreateMaintenanceDto,
  MaintenanceQueryDto,
} from "../dtos";
import { MaintenanceProcedure } from "../entities/vehicle/maintenance/MaintenanceProcedure";
import { VehicleMaintenance } from "../entities/vehicle/maintenance/VehicleMaintenance";
import { MaintenanceAlert } from "../entities/vehicle/maintenance/MaintenanceAlert";
import { MaintenanceSchedule } from "../entities/vehicle/maintenance/MaintenanceSchedule";
import { Vehicle } from "../entities/vehicle/Vehicle";

export abstract class VehicleMaintenanceRepository {
  // Procedimientos de Mantenimiento
  abstract createMaintenanceProcedure(
    data: CreateMaintenanceProcedureDto
  ): Promise<MaintenanceProcedure>;
  abstract getMaintenanceProcedures(): Promise<MaintenanceProcedure[]>;
  abstract updateMaintenanceProcedure(
    id: number,
    data: Partial<CreateMaintenanceProcedureDto>
  ): Promise<MaintenanceProcedure>;
  abstract deleteMaintenanceProcedure(id: number): Promise<void>;

  // Gestión de Mantenimientos
  abstract createMaintenance(
    data: CreateMaintenanceDto
  ): Promise<VehicleMaintenance>;
  abstract getMaintenances(filters: MaintenanceQueryDto): Promise<{
    maintenances: VehicleMaintenance[];
    total: number;
  }>;
  abstract getMaintenanceById(id: string): Promise<VehicleMaintenance | null>;
  abstract updateMaintenanceStatus(
    id: string,
    status:
      | "PROGRAMADO"
      | "EN_PROGRESO"
      | "COMPLETADO"
      | "CANCELADO"
      | "VENCIDO"
      | "PARCIAL"
  ): Promise<VehicleMaintenance>;
  abstract deleteMaintenance(id: string): Promise<void>;

  // Sistema de Alertas Automáticas
  abstract generateMaintenanceAlerts(): Promise<MaintenanceAlert[]>;
  abstract getMaintenanceAlerts(
    vehicleId?: string,
    priority?: "BAJO" | "MEDIO" | "ALTO" | "CRITICO"
  ): Promise<MaintenanceAlert[]>;
  abstract markAlertAsRead(alertId: string): Promise<MaintenanceAlert>;
  abstract dismissAlert(alertId: string): Promise<void>;

  // Reportes y Análisis
  abstract getMaintenanceReport(filters: MaintenanceReportDto): Promise<any>;
  abstract getMaintenanceCostAnalysis(
    dateFrom: Date,
    dateTo: Date
  ): Promise<any>;
  abstract getVehicleMaintenanceEfficiency(vehicleId?: string): Promise<any>;
  abstract getIncompleteMaintenanceReport(): Promise<VehicleMaintenance[]>;
  abstract getOverdueMaintenances(): Promise<VehicleMaintenance[]>;
  abstract getUpcomingMaintenances(days: number): Promise<VehicleMaintenance[]>;

  // Automatización
  abstract checkAndCreateScheduledMaintenances(): Promise<VehicleMaintenance[]>;
  abstract calculateNextMaintenanceDate(
    vehicleId: string
  ): Promise<{ nextDate: Date; nextMileage?: number }>;
  abstract getVehicleLastMaintenanceDate(
    vehicleId: string
  ): Promise<Date | null>;
  abstract getVehicleMaintenanceSchedule(
    vehicleId: string
  ): Promise<MaintenanceSchedule | null>;
}
