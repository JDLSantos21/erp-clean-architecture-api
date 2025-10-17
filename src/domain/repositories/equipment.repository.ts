import {
  CreateEquipmentAssignmentDto,
  CreateEquipmentDto,
  CreateEquipmentModelDto,
  CreateEquipmentReportDto,
  CreateEquipmentRequestDto,
  EquipmentQueryDto,
  UnassignEquipmentDto,
  UpdateEquipmentModelDto,
} from "../dtos";
import {
  Equipment,
  EquipmentAssignment,
  EquipmentModel,
  EquipmentReport,
  EquipmentStatus,
} from "../entities";
import { FilterParams } from "../types";
import { EquipmentSerialNumber, IntegerId, UUID } from "../value-object";

export abstract class EquipmentRepository {
  abstract createEquipment(
    data: CreateEquipmentDto & { serialNumber: EquipmentSerialNumber }
  ): Promise<Equipment>;
  abstract findOne(id: UUID): Promise<Equipment>;
  abstract delete(id: UUID): Promise<void>;
  abstract update(id: UUID, data: unknown): Promise<Equipment>;
  abstract findAll(
    filterParams: FilterParams<EquipmentQueryDto>
  ): Promise<{ equipments: Equipment[]; total: number }>;
  abstract updateStatus(id: UUID, status: EquipmentStatus): Promise<void>;

  abstract createEquipmentModel(
    data: CreateEquipmentModelDto
  ): Promise<EquipmentModel>;
  abstract findOneModel(id: IntegerId): Promise<EquipmentModel>;
  abstract updateModel(
    id: IntegerId,
    data: UpdateEquipmentModelDto
  ): Promise<EquipmentModel>;
  abstract deleteModel(id: IntegerId): Promise<void>;
  abstract findAllModels(): Promise<EquipmentModel[]>;

  abstract createRequest(data: CreateEquipmentRequestDto): Promise<void>;
  abstract deleteRequest(id: IntegerId): Promise<void>;

  abstract createAssignment(
    data: CreateEquipmentAssignmentDto,
    currentStatus: EquipmentStatus
  ): Promise<void>;

  abstract findAssignment(id: IntegerId): Promise<EquipmentAssignment>;

  abstract unassignEquipment(data: UnassignEquipmentDto): Promise<void>;

  abstract deleteAssignment(id: IntegerId): Promise<void>;

  abstract createReport(
    data: CreateEquipmentReportDto
  ): Promise<EquipmentReport>;
}
