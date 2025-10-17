import { EquipmentModel } from "../../../domain";

export class modelResponseDto {
  id!: number;
  name!: string;
  brand?: string | null;
  type!: string;
  capacity?: number | null;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<modelResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: EquipmentModel): modelResponseDto {
    return new modelResponseDto({
      id: entity.id.value,
      name: entity.name,
      brand: entity.brand,
      type: entity.type,
      capacity: entity.capacity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: EquipmentModel[]): modelResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
