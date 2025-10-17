import { AssignmentStatus, EquipmentAssignment } from "../../../domain";

export class AssignmentResponseDto {
  id!: number;
  assignedAt!: Date;
  unassignedAt?: Date | null;
  deliveredAt?: Date | null;
  status!: AssignmentStatus;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<AssignmentResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: EquipmentAssignment): AssignmentResponseDto {
    return new AssignmentResponseDto({
      id: entity.id.value,
      assignedAt: entity.assignedAt,
      unassignedAt: entity.unassignedAt,
      deliveredAt: entity.deliveredAt,
      status: entity.status,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(
    entities: EquipmentAssignment[]
  ): AssignmentResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
