import {
  AssignOrderToEmployeeDto,
  CreateOrderDto,
  OrderQueryDto,
  UpdateOrderDto,
} from "../dtos";
import { Order, OrderStatus } from "../entities";
import { FilterParams, OrderStatusUpdate } from "../types";
import { IntegerId } from "../value-object";

export abstract class OrderDatasource {
  abstract create(data: CreateOrderDto): Promise<Order>;
  abstract update(id: IntegerId, data: UpdateOrderDto): Promise<Order | null>;
  abstract delete(id: IntegerId): Promise<void>;
  abstract list(filterParams: FilterParams<OrderQueryDto>): Promise<Order[]>;
  abstract findOne(id: IntegerId): Promise<Order | null>;
  abstract findOneByTrackingCode(trackingCode: string): Promise<Order | null>;
  abstract generateTrackingCode(year: number): Promise<string>;
  abstract updateStatus(
    id: IntegerId,
    status: OrderStatusUpdate
  ): Promise<Order | null>;
  abstract getOrderCurrentStatus(id: IntegerId): Promise<OrderStatus | null>;
  abstract assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void>;
  abstract unassignOrder(orderId: IntegerId): Promise<void>;
  abstract findOrdersByCustomerId(
    customerId: string,
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<Order[]>;
  abstract trackingCodeExists(trackingCode: string): Promise<boolean>;
  abstract cancelOrder(id: IntegerId): Promise<Order | null>;
}
