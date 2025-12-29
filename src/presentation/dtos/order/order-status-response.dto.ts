import { OrderStatusHistory } from "../../../domain";

export class OrderStatusResponseDto {
  status!: string;
  description?: string;
  changedAt!: Date;
  changedBy!: {
    id: string;
    name: string;
  };
  private constructor(data: Partial<OrderStatusResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: OrderStatusHistory): OrderStatusResponseDto {
    return new OrderStatusResponseDto({
      status: entity.status,
      description: entity.description,
      changedAt: entity.createdAt,
      changedBy: {
        id: entity.createdByUser!.id,
        name: `${entity.createdByUser!.name} ${entity.createdByUser!.lastName}`,
      },
    });
  }

  static fromEntities(
    entities: OrderStatusHistory[]
  ): OrderStatusResponseDto[] {
    return entities.map((entity) => OrderStatusResponseDto.fromEntity(entity));
  }
}
