import Entity from "../entity";

export class Vehicle extends Entity<Vehicle> {
  id!: string;
  licensePlate!: string;
  chasis!: string;
  brand!: string;
  model!: string;
  year!: number;
  currentTag!: string;
  currentMileage?: number;
  lastMaintenanceDate?: Date;
  lastMaintenanceMileage?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones con mantenimiento
  maintenances?: any[]; // VehicleMaintenance[]
  maintenanceAlerts?: any[]; // MaintenanceAlert[]
  maintenanceSchedule?: any; // MaintenanceSchedule
}
