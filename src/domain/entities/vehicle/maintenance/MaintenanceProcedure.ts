import Entity from "../../entity";

export enum MaintenanceCategory {
  MOTOR = "MOTOR",
  TRANSMISION = "TRANSMISION",
  FRENOS = "FRENOS",
  FILTROS = "FILTROS",
  FLUIDOS = "FLUIDOS",
  LLANTAS = "LLANTAS",
  ELECTRICO = "ELECTRICO",
  CARROCERIA = "CARROCERIA",
  PREVENTIVO = "PREVENTIVO",
}

export class MaintenanceProcedure extends Entity<MaintenanceProcedure> {
  id!: number;
  name!: string;
  description?: string;
  category!: MaintenanceCategory;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
