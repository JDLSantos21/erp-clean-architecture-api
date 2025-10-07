import {
  AssignOrderToEmployeeDto,
  CreateOrderDto,
  OrderQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos";
import { Order, OrderStatus } from "../entities";
import { FilterParams } from "../types";
import { IntegerId } from "../value-object";

export abstract class OrderRepository {
  abstract create(
    data: CreateOrderDto & { trackingCode: string }
  ): Promise<Order>;
  abstract update(id: IntegerId, data: UpdateOrderDto): Promise<Order>;
  abstract delete(id: IntegerId): Promise<void>;
  abstract list(
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<{ orders: Order[]; total: number }>;
  abstract findOne(id: IntegerId): Promise<Order>;
  abstract findOneByTrackingCode(trackingCode: string): Promise<Order>;
  abstract updateStatus(data: UpdateOrderStatusDto): Promise<void>;
  abstract getOrderCurrentStatus(id: IntegerId): Promise<OrderStatus | null>;
  abstract assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void>;
  abstract unassignOrder(orderId: IntegerId): Promise<void>;
  abstract findOrdersByCustomerId(
    customerId: string,
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<Order[]>;
  abstract trackingCodeExists(trackingCode: string): Promise<boolean>;
}
