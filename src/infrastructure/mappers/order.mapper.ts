import {
  CreateOrderI,
  Customer,
  IntegerId,
  Order,
  OrderItem,
  TrackingCode,
  UpdateOrderDto,
} from "../../domain";
import { CustomerMapper } from "./customer.mapper";

export class OrderMapper {
  static OrderFromDtoToPersistence(order: CreateOrderI) {
    const {
      userId,
      customerAddressId,
      customerId,
      orderItems,
      trackingCode,
      scheduledDate,
      deliveryNotes,
      notes,
    } = order;

    const mainOrderInfo = {
      customerId: customerId.value,
      customerAddressId: customerAddressId.value,
      createdById: userId.value,
      scheduledDate: scheduledDate ? scheduledDate.toDate() : undefined,
      deliveryNotes,
      notes,
      trackingCode,
    };

    const mappedOrderItems = orderItems.map((item) => ({
      productId: item.productId.value,
      requestedQuantity: item.requestedQuantity,
      notes: item.notes,
    }));

    const mappedOrder = { mainOrderInfo, orderItems: mappedOrderItems };

    return mappedOrder;
  }

  static toDomain(orderData: any): Order {
    let orderItems: OrderItem[] = [];
    if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
      orderItems = orderData.orderItems.map((item: any) => {
        return this.orderItemToDomain(item);
      });
    }

    let customer: Customer | undefined;

    if (orderData.customer) {
      customer = CustomerMapper.customerEntityFromObject(orderData.customer);
    }

    return new Order({
      id: IntegerId.create(orderData.id),
      trackingCode: TrackingCode.create(orderData.trackingCode),
      customerId: orderData.customerId,
      customerAddressId: orderData.customerAddressId,
      orderDate: orderData.orderDate,
      scheduledDate: orderData.scheduledDate,
      deliveredDate: orderData.deliveredDate,
      createdById: orderData.createdById,
      assignedToId: orderData.assignedToId,
      deliveryNotes: orderData.deliveryNotes,
      notes: orderData.notes,
      isActive: orderData.isActive,
      createdAt: orderData.createdAt,
      updatedAt: orderData.updatedAt,
      // Relaciones
      customer,
      orderItems,
      statusHistory: orderData.statusHistory,
      customerAddress: orderData.customerAddress,
      createdByUser: orderData.createdByUser,
      assignedToUser: orderData.assignedToUser,
    });
  }

  static orderItemToDomain(item: any): OrderItem {
    return new OrderItem({
      id: IntegerId.create(item.id),
      orderId: IntegerId.create(item.orderId),
      productId: IntegerId.create(item.productId),
      product: item.product,
      requestedQuantity: item.requestedQuantity,
      deliveredQuantity: item.deliveredQuantity,
      notes: item.notes,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  static orderItemFromDtoToPersistence(item: any) {
    return {
      productId: item.productId.value,
      requestedQuantity: item.requestedQuantity,
      notes: item.notes,
    };
  }

  static orderUpdateFromDtoToPersistence(data: UpdateOrderDto) {
    const { orderId, deliveryNotes, notes, orderItems, scheduledDate } = data;

    const updatedData = {
      orderId: orderId.value,
      deliveryNotes,
      notes,
      scheduledDate: scheduledDate ? scheduledDate.toDate() : undefined,
    };

    let orderItemsArray;

    if (data.orderItems && Array.isArray(data.orderItems)) {
      orderItemsArray = data.orderItems.map((item) => {
        return {
          productId: item.productId.value,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes,
        };
      });
    }

    return { ...updatedData, orderItems: orderItemsArray };
  }
}
