import { EQUIPMENT_STATUS } from "../../constants";
import { EquipmentSerialNumber, IntegerId, UUID } from "../../value-object";
import Entity from "../entity";
import { EquipmentAssignment } from "./EquipmentAssigment";
import { EquipmentLocation } from "./EquipmentLocation";
import { EquipmentModel } from "./EquipmentModel";
import { EquipmentReport } from "./EquipmentReport";

export type EquipmentStatus = keyof typeof EQUIPMENT_STATUS;

export class Equipment extends Entity<Equipment> {
  id!: UUID;
  serialNumber!: EquipmentSerialNumber;
  modelId!: IntegerId;
  locationId?: IntegerId;
  status!: EquipmentStatus;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  //relaciones
  model?: EquipmentModel;
  location?: EquipmentLocation;
  assignments?: EquipmentAssignment[];
  reports?: EquipmentReport[];

  // Métodos de negocio para gestión de estado
  public isAvailable(): boolean {
    return this.status === "DISPONIBLE" && this.isActive;
  }

  public isAssigned(): boolean {
    return this.status === "ASIGNADO";
  }

  public isInMaintenance(): boolean {
    return this.status === "MANTENIMIENTO";
  }

  public isDamaged(): boolean {
    return this.status === "DAÑADO";
  }

  public isOutOfService(): boolean {
    return this.status === "INHABILITADO" || !this.isActive;
  }

  public assign(): void {
    if (!this.isAvailable()) {
      throw new Error("El equipo debe estar disponible para asignarlo");
    }

    this.status = "ASIGNADO";
    this.updatedAt = new Date();
  }

  public unassign(): void {
    if (!this.isAssigned()) {
      throw new Error("El equipo debe estar asignado para desasignarlo");
    }

    this.status = "DISPONIBLE";
    this.updatedAt = new Date();
  }

  public sendToMaintenance(): void {
    if (this.isOutOfService()) {
      throw new Error(
        "No se puede enviar a mantenimiento un equipo fuera de servicio"
      );
    }

    this.status = "MANTENIMIENTO";
    this.updatedAt = new Date();
  }

  public completeMaintenanceAsWorking(): void {
    if (!this.isInMaintenance()) {
      throw new Error(
        "El equipo debe estar en mantenimiento para completar el mantenimiento"
      );
    }

    this.status = "DISPONIBLE";
    this.updatedAt = new Date();
  }

  public markAsDamaged(): void {
    this.status = "DAÑADO";
    this.updatedAt = new Date();
  }

  public markAsOutOfService(): void {
    this.status = "INHABILITADO";
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public reactivate(): void {
    if (this.isOutOfService()) {
      this.status = "DISPONIBLE";
      this.isActive = true;
      this.updatedAt = new Date();
    } else if (this.isDamaged()) {
      this.status = "DISPONIBLE";
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
