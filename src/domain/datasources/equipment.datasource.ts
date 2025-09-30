import { Equipment, EquipmentModel, EquipmentLocation } from "../entities";
import { EquipmentStatus } from "../entities";

export interface CreateEquipmentDto {
  name: string;
  serialNumber: string;
  modelId: number;
  locationId?: number;
  status?: EquipmentStatus;
}

export interface UpdateEquipmentDto {
  id: string;
  name?: string;
  serialNumber?: string;
  modelId?: number;
  locationId?: number;
  status?: EquipmentStatus;
  isActive?: boolean;
}

export interface CreateEquipmentModelDto {
  name: string;
  brand: string;
  description?: string;
  specifications?: string;
}

export interface CreateEquipmentLocationDto {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface EquipmentFilters {
  name?: string;
  serialNumber?: string;
  modelId?: number;
  locationId?: number;
  status?: EquipmentStatus;
  isActive?: boolean;
}

export interface EquipmentSummary {
  totalEquipment: number;
  availableEquipment: number;
  assignedEquipment: number;
  inMaintenanceEquipment: number;
  damagedEquipment: number;
  outOfServiceEquipment: number;
  lostEquipment: number;
}

export abstract class EquipmentDatasource {
  // Equipment CRUD Operations
  abstract createEquipment(
    createEquipmentDto: CreateEquipmentDto
  ): Promise<Equipment>;
  abstract getEquipmentById(id: string): Promise<Equipment>;
  abstract getAllEquipment(filters?: EquipmentFilters): Promise<Equipment[]>;
  abstract updateEquipment(
    updateEquipmentDto: UpdateEquipmentDto
  ): Promise<Equipment>;
  abstract deleteEquipment(id: string): Promise<Equipment>;

  // Equipment Model Operations
  abstract createEquipmentModel(
    createModelDto: CreateEquipmentModelDto
  ): Promise<EquipmentModel>;
  abstract getEquipmentModels(isActive?: boolean): Promise<EquipmentModel[]>;
  abstract updateEquipmentModel(
    id: number,
    updates: Partial<CreateEquipmentModelDto>
  ): Promise<EquipmentModel>;
  abstract deleteEquipmentModel(id: number): Promise<EquipmentModel>;

  // Equipment Location Operations
  abstract createEquipmentLocation(
    createLocationDto: CreateEquipmentLocationDto
  ): Promise<EquipmentLocation>;
  abstract getEquipmentLocations(
    isActive?: boolean
  ): Promise<EquipmentLocation[]>;
  abstract updateEquipmentLocation(
    id: number,
    updates: Partial<CreateEquipmentLocationDto>
  ): Promise<EquipmentLocation>;
  abstract deleteEquipmentLocation(id: number): Promise<EquipmentLocation>;

  // Status Management Operations
  abstract changeEquipmentStatus(
    equipmentId: string,
    newStatus: EquipmentStatus
  ): Promise<Equipment>;
  abstract assignEquipment(equipmentId: string): Promise<Equipment>;
  abstract unassignEquipment(equipmentId: string): Promise<Equipment>;
  abstract sendToMaintenance(equipmentId: string): Promise<Equipment>;
  abstract completeMaintenanceAsWorking(
    equipmentId: string
  ): Promise<Equipment>;
  abstract markAsDamaged(equipmentId: string): Promise<Equipment>;
  abstract markAsOutOfService(equipmentId: string): Promise<Equipment>;
  abstract markAsLost(equipmentId: string): Promise<Equipment>;
  abstract reactivateEquipment(equipmentId: string): Promise<Equipment>;

  // Query Operations
  abstract getAvailableEquipment(): Promise<Equipment[]>;
  abstract getAssignedEquipment(): Promise<Equipment[]>;
  abstract getEquipmentInMaintenance(): Promise<Equipment[]>;
  abstract getDamagedEquipment(): Promise<Equipment[]>;
  abstract searchEquipment(query: string): Promise<Equipment[]>;
  abstract getEquipmentByModel(modelId: number): Promise<Equipment[]>;
  abstract getEquipmentByLocation(locationId: number): Promise<Equipment[]>;

  // Analytics and Reporting
  abstract getEquipmentSummary(): Promise<EquipmentSummary>;
  abstract getEquipmentUtilizationReport(): Promise<
    Array<
      Equipment & {
        assignmentHistory: number;
        maintenanceHistory: number;
        currentStatus: EquipmentStatus;
      }
    >
  >;

  // Business Validation
  abstract validateSerialNumberUniqueness(
    serialNumber: string,
    excludeId?: string
  ): Promise<boolean>;
  abstract canEquipmentBeAssigned(equipmentId: string): Promise<boolean>;
  abstract canEquipmentReceiveMaintenanceRequest(
    equipmentId: string
  ): Promise<boolean>;
}
