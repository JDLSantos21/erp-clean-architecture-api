import {
  AssignOrderToEmployeeDto,
  CreateOrderDto,
  OrderQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../dtos";
import { Order } from "../entities";
import { FilterParams } from "../types";
import { IntegerId } from "../value-object";

export interface CreateOrderI extends CreateOrderDto {
  trackingCode: string;
}

export abstract class OrderDatasource {
  abstract create(data: CreateOrderI): Promise<Order>;
  abstract update(id: IntegerId, data: UpdateOrderDto): Promise<Order>;
  abstract delete(id: IntegerId): Promise<void>;
  abstract list(
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<{ orders: Order[]; total: number }>;
  abstract findOne(id: IntegerId): Promise<Order>;
  abstract findOneByTrackingCode(trackingCode: string): Promise<Order>;
  abstract updateStatus(data: UpdateOrderStatusDto): Promise<void>;
  abstract assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void>;
  abstract unassignOrder(orderId: IntegerId): Promise<void>;
  abstract trackingCodeExists(trackingCode: string): Promise<boolean>;
}
