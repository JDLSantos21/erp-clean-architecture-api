import { AssignmentStatus, EquipmentAssignment } from "../../../domain";

export class AssignmentResponseDto {
  id!: number;
  customer?: {
    id: string;
    businessName: string;
    representativeName: string;
  };
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
    let customerData = undefined;

    if (entity.customer) {
      customerData = {
        id: entity.customer?.id,
        businessName: entity.customer?.businessName,
        representativeName: entity.customer?.representativeName,
      };
    }

    return new AssignmentResponseDto({
      id: entity.id.value,
      customer: customerData,
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
    entities: EquipmentAssignment[],
  ): AssignmentResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
