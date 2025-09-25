import Entity from "../../entity";

export enum AlertType {
  POR_FECHA = "POR_FECHA",
  POR_KILOMETRAJE = "POR_KILOMETRAJE",
  VENCIDO = "VENCIDO",
  URGENTE = "URGENTE",
}

export enum AlertPriority {
  BAJO = "BAJO",
  MEDIO = "MEDIO",
  ALTO = "ALTO",
  CRITICO = "CRITICO",
}

export class MaintenanceAlert extends Entity<MaintenanceAlert> {
  id!: string;
  vehicleId!: string;
  alertType!: AlertType;
  message!: string;
  isRead!: boolean;
  scheduledFor?: Date;
  daysDue?: number;
  kilometersDue?: number;
  priority!: AlertPriority;
  createdAt!: Date;

  // Relaciones
  vehicle?: any; // Vehicle
}
