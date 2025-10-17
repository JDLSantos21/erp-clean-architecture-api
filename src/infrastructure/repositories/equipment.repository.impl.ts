import {
  CreateEquipmentAssignmentDto,
  CreateEquipmentDto,
  CreateEquipmentModelDto,
  CreateEquipmentReportDto,
  CreateEquipmentRequestDto,
  Equipment,
  EquipmentAssignment,
  EquipmentDatasource,
  EquipmentModel,
  EquipmentQueryDto,
  EquipmentReport,
  EquipmentRepository,
  EquipmentStatus,
  FilterParams,
  IntegerId,
  UnassignEquipmentDto,
  UpdateEquipmentModelDto,
  UUID,
} from "../../domain";

export class EquipmentRepositoryImpl implements EquipmentRepository {
  constructor(private readonly equipmentDatasource: EquipmentDatasource) {}

  createAssignment(
    data: CreateEquipmentAssignmentDto,
    currentStatus: EquipmentStatus
  ): Promise<void> {
    return this.equipmentDatasource.createAssignment(data, currentStatus);
  }

  createEquipment(data: CreateEquipmentDto): Promise<Equipment> {
    return this.equipmentDatasource.createEquipment(data);
  }

  createEquipmentModel(data: CreateEquipmentModelDto): Promise<EquipmentModel> {
    return this.equipmentDatasource.createEquipmentModel(data);
  }

  createReport(data: CreateEquipmentReportDto): Promise<EquipmentReport> {
    return this.equipmentDatasource.createReport(data);
  }

  createRequest(data: CreateEquipmentRequestDto): Promise<void> {
    return this.equipmentDatasource.createRequest(data);
  }

  delete(id: UUID): Promise<void> {
    return this.equipmentDatasource.delete(id);
  }

  deleteModel(id: IntegerId): Promise<void> {
    return this.equipmentDatasource.deleteModel(id);
  }

  deleteRequest(id: IntegerId): Promise<void> {
    return this.equipmentDatasource.deleteRequest(id);
  }

  findAll(
    filterParams: FilterParams<EquipmentQueryDto>
  ): Promise<{ equipments: Equipment[]; total: number }> {
    return this.equipmentDatasource.findAll(filterParams);
  }

  findAllModels(): Promise<EquipmentModel[]> {
    return this.equipmentDatasource.findAllModels();
  }

  findOne(id: UUID): Promise<Equipment> {
    return this.equipmentDatasource.findOne(id);
  }

  findOneModel(id: IntegerId): Promise<EquipmentModel> {
    return this.equipmentDatasource.findOneModel(id);
  }

  update(id: UUID, data: unknown): Promise<Equipment> {
    return this.equipmentDatasource.update(id, data);
  }

  updateModel(
    id: IntegerId,
    data: UpdateEquipmentModelDto
  ): Promise<EquipmentModel> {
    return this.equipmentDatasource.updateModel(id, data);
  }

  updateStatus(id: UUID, status: EquipmentStatus): Promise<void> {
    return this.equipmentDatasource.updateStatus(id, status);
  }

  findAssignment(id: IntegerId): Promise<EquipmentAssignment> {
    return this.equipmentDatasource.findAssignment(id);
  }

  unassignEquipment(data: UnassignEquipmentDto): Promise<void> {
    return this.equipmentDatasource.unassignEquipment(data);
  }

  deleteAssignment(id: IntegerId): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
