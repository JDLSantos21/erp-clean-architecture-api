import { Order } from "../../../domain";

export class OrderResponseDto {
  id!: number;
  trackingCode!: string;
  status!: string;
  date!: Date;
  scheduledDate!: Date | null;
  deliveredDate!: Date | null;
  deliveryNotes!: string | null;
  notes!: string | null;
  products!: Array<{
    id: number;
    name: string;
    quantity: number;
    size: string | null;
    unit: string;
  }>;
  customer?: {
    id: string;
    businessName: string;
    representativeName: string;
  };
  address?: {
    id: number;
    branchName: string | null;
    city: string;
    direction: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  phone?: {
    id: number;
    number: string;
    hasWhatsapp: boolean;
    type: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };

  private constructor(data: Partial<OrderResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(entity: Order): OrderResponseDto {
    return new OrderResponseDto({
      id: entity.id.value,
      trackingCode: entity.trackingCode.value,
      status: entity.status,
      date: entity.orderDate,
      scheduledDate: entity.scheduledDate,
      deliveredDate: entity.deliveredDate,
      deliveryNotes: entity.deliveryNotes,
      notes: entity.notes,
      products: entity.orderItems
        ? entity.orderItems.map((item) => ({
            id: item.productId.value,
            name: item.product!.name,
            quantity: item.requestedQuantity,
            size: item.product!.size || null,
            unit: item.product!.unit,
          }))
        : [],
      customer: entity.customer
        ? {
            id: entity.customer.id,
            businessName: entity.customer.businessName,
            representativeName: entity.customer.representativeName,
          }
        : undefined,
      address: entity.customerAddress
        ? {
            id: entity.customerAddress.id,
            branchName: entity.customerAddress.branchName || null,
            city: entity.customerAddress.city,
            direction: entity.customerAddress.direction,
            coordinates: {
              latitude: entity.customerAddress.latitude || null,
              longitude: entity.customerAddress.longitude || null,
            },
          }
        : undefined,
      phone: entity.customer?.phones
        ? {
            id: entity.customer.phones[0].id,
            number: entity.customer.phones[0].phoneNumber,
            hasWhatsapp: entity.customer.phones[0].hasWhatsapp,
            type: entity.customer.phones[0].type,
          }
        : undefined,
      assignedTo: entity.assignedToUser
        ? {
            id: entity.assignedToUser.id,
            name: `${entity.assignedToUser.name} ${entity.assignedToUser.lastName}`,
          }
        : undefined,
    });
  }

  static fromEntities(entities: Order[]): OrderResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
