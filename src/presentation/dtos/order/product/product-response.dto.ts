import { Product } from "../../../../domain";

export class ProductResponseDto {
  id!: number;
  name!: string;
  description?: string | null;
  unit!: string;
  size?: string | null;
  sku?: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: Product): ProductResponseDto {
    return {
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      unit: entity.unit,
      size: entity.size,
      sku: entity.sku,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static fromEntities(entities: Product[]): ProductResponseDto[] {
    return entities.map(ProductResponseDto.fromEntity);
  }
}
