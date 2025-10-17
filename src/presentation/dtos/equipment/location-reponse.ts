import { EquipmentLocation } from "../../../domain";

interface Coordinates {
  longitude: number;
  latitude: number;
}

export class LocationResponseDto {
  id!: number;
  coordinates!: Coordinates;
  address?: string;
  description?: string;
  createdAt!: Date;
  updatedAt!: Date;

  private constructor(data: Partial<LocationResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: EquipmentLocation): LocationResponseDto {
    return new LocationResponseDto({
      id: entity.id,
      address: entity.address,
      coordinates: {
        latitude: entity.latitude,
        longitude: entity.longitude,
      },
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static fromEntities(entities: EquipmentLocation[]): LocationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
