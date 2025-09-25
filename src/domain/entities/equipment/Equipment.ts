import Entity from "../entity";
import { EquipmentLocation } from "./EquipmentLocation";
import { EquipmentModel } from "./EquipmentModel";

export enum EquipmentStatus {
  DISPONIBLE = "DISPONIBLE",
  ASIGNADO = "ASIGNADO",
  MANTENIMIENTO = "MANTENIMIENTO",
  DAÑADO = "DAÑADO",
  INHABILITADO = "INHABILITADO",
}

export class Equipment extends Entity<Equipment> {
  id!: string;
  name!: string;
  serialNumber!: string;
  modelId!: number;
  model?: EquipmentModel;
  locationId?: number;
  location?: EquipmentLocation;
  status!: EquipmentStatus;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  // Métodos de negocio para gestión de estado
  public isAvailable(): boolean {
    return this.status === EquipmentStatus.DISPONIBLE && this.isActive;
  }

  public isAssigned(): boolean {
    return this.status === EquipmentStatus.ASIGNADO;
  }

  public isInMaintenance(): boolean {
    return this.status === EquipmentStatus.MANTENIMIENTO;
  }

  public isDamaged(): boolean {
    return this.status === EquipmentStatus.DAÑADO;
  }

  public isOutOfService(): boolean {
    return this.status === EquipmentStatus.INHABILITADO || !this.isActive;
  }

  public assign(): void {
    if (!this.isAvailable()) {
      throw new Error("El equipo debe estar disponible para asignarlo");
    }

    this.status = EquipmentStatus.ASIGNADO;
    this.updatedAt = new Date();
  }

  public unassign(): void {
    if (!this.isAssigned()) {
      throw new Error("El equipo debe estar asignado para desasignarlo");
    }

    this.status = EquipmentStatus.DISPONIBLE;
    this.updatedAt = new Date();
  }

  public sendToMaintenance(): void {
    if (this.isOutOfService()) {
      throw new Error(
        "No se puede enviar a mantenimiento un equipo fuera de servicio"
      );
    }

    this.status = EquipmentStatus.MANTENIMIENTO;
    this.updatedAt = new Date();
  }

  public completeMaintenanceAsWorking(): void {
    if (!this.isInMaintenance()) {
      throw new Error(
        "El equipo debe estar en mantenimiento para completar el mantenimiento"
      );
    }

    this.status = EquipmentStatus.DISPONIBLE;
    this.updatedAt = new Date();
  }

  public markAsDamaged(): void {
    this.status = EquipmentStatus.DAÑADO;
    this.updatedAt = new Date();
  }

  public markAsOutOfService(): void {
    this.status = EquipmentStatus.INHABILITADO;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.isOutOfService()) {
      this.status = EquipmentStatus.DISPONIBLE;
      this.isActive = true;
      this.updatedAt = new Date();
    } else if (this.isDamaged()) {
      this.status = EquipmentStatus.DISPONIBLE;
      this.updatedAt = new Date();
    } else {
      throw new Error(
        "Solo se puede reactivar un equipo que esté inhabilitado o dañado"
      );
    }
  }

  public canBeAssigned(): boolean {
    return this.isAvailable();
  }

  public canReceiveMaintenanceRequest(): boolean {
    return this.isActive && !this.isOutOfService();
  }
}
