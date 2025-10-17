import { Equipment, EquipmentStatus } from "../../../domain";
import { AssignmentResponseDto } from "./assignment-response";
import { LocationResponseDto } from "./location-reponse";
import { modelResponseDto } from "./model-response";
import { ReportResponseDto } from "./report-response";

interface EquipmentOptions {
  includeModel?: boolean;
  includeLocation?: boolean;
  includeAssignments?: boolean;
  includeReports?: boolean;
}

export class EquipmentResponseDto {
  id!: string;
  serialNumber!: string;
  status!: EquipmentStatus;
  model!: modelResponseDto | undefined;
  location?: LocationResponseDto | undefined;
  assignments?: AssignmentResponseDto[] | undefined;
  reports?: ReportResponseDto[] | undefined;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<EquipmentResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(
    entity: Equipment,
    options: EquipmentOptions
  ): EquipmentResponseDto {
    const dto = new EquipmentResponseDto({
      id: entity.id.value,
      serialNumber: entity.serialNumber.value,
      status: entity.status,
      model: options.includeModel
        ? entity.model
          ? modelResponseDto.fromEntity(entity.model)
          : undefined
        : undefined,
      location: options.includeLocation
        ? entity.location
          ? LocationResponseDto.fromEntity(entity.location)
          : undefined
        : undefined,
      assignments: options.includeAssignments
        ? entity.assignments
          ? AssignmentResponseDto.fromEntities(entity.assignments)
          : undefined
        : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    return dto;
  }

  static fromEntities(entities: Equipment[]): EquipmentResponseDto[] {
    return entities.map((entity) =>
      this.fromEntity(entity, { includeModel: true, includeLocation: false })
    );
  }
}
