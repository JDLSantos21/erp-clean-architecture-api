import Entity from "../../entity";

export enum MaintenanceStatus {
  PROGRAMADO = "PROGRAMADO",
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  VENCIDO = "VENCIDO",
  PARCIAL = "PARCIAL",
}

export class VehicleMaintenance extends Entity<VehicleMaintenance> {
  id!: string;
  vehicleId!: string;
  scheduledDate?: Date;
  performedDate?: Date;
  currentMileage?: number;
  nextScheduledDate?: Date;
  nextScheduledMileage?: number;
  totalCost?: number;
  notes?: string;
  status!: MaintenanceStatus;
  performedBy?: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  vehicle?: any; // Se puede tipear más específicamente si se necesita
  user?: any;
  maintenanceItems?: VehicleMaintenanceItem[];
}

export class VehicleMaintenanceItem extends Entity<VehicleMaintenanceItem> {
  id!: string;
  vehicleMaintenanceId!: string;
  procedureId!: number;
  isCompleted!: boolean;
  cost?: number;
  notes?: string;
  completedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  vehicleMaintenance?: VehicleMaintenance;
  procedure?: any; // MaintenanceProcedure
}
