import { Order } from "../../../domain";

export class OrderListResponseDto {
  id!: number;
  trackingCode!: string;
  status!: string;
  orderDate!: string;
  scheduledDate!: string | null;
  customerName!: string;
  totalProducts!: number;
  isActive!: boolean;

  private constructor(data: Partial<OrderListResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(order: Order): OrderListResponseDto {
    return new OrderListResponseDto({
      id: order.id.value,
      trackingCode: order.trackingCode.value,
      status: order.getCurrentStatus(),
      orderDate: order.orderDate.toISOString(),
      scheduledDate: order.scheduledDate
        ? order.scheduledDate.toISOString()
        : null,
      customerName: order.customer
        ? order.customer.businessName
        : "Cliente no disponible",
      totalProducts: order.orderItems ? order.orderItems.length : 0,
      isActive: order.isActive,
    });
  }

  static fromEntities(orders: Order[]): OrderListResponseDto[] {
    return orders.map((order) => OrderListResponseDto.fromEntity(order));
  }
}
