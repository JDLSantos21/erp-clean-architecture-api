import Entity from "../../entity";

export class MaintenanceSchedule extends Entity<MaintenanceSchedule> {
  id!: number;
  vehicleId!: string;
  intervalMonths!: number;
  intervalKilometers?: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Relaciones
  vehicle?: any; // Vehicle
}
