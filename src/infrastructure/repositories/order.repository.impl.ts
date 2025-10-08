import {
  AssignOrderToEmployeeDto,
  CreateOrderDto,
  FilterParams,
  IntegerId,
  Order,
  OrderDatasource,
  OrderQueryDto,
  OrderRepository,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../../domain";

export class OrderRepositoryImpl implements OrderRepository {
  constructor(private readonly orderDatasource: OrderDatasource) {}

  async create(
    data: CreateOrderDto & { trackingCode: string }
  ): Promise<Order> {
    return this.orderDatasource.create(data);
  }

  async update(id: IntegerId, data: UpdateOrderDto): Promise<Order> {
    return this.orderDatasource.update(id, data);
  }

  async delete(id: IntegerId): Promise<void> {
    return this.orderDatasource.delete(id);
  }

  async list(
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<{ orders: Order[]; total: number }> {
    return this.orderDatasource.list(filterParams);
  }

  async findOne(id: IntegerId): Promise<Order> {
    return this.orderDatasource.findOne(id);
  }

  async findOneByTrackingCode(trackingCode: string): Promise<Order> {
    return this.orderDatasource.findOneByTrackingCode(trackingCode);
  }

  async trackingCodeExists(trackingCode: string): Promise<boolean> {
    return this.orderDatasource.trackingCodeExists(trackingCode);
  }

  async updateStatus(data: UpdateOrderStatusDto): Promise<void> {
    return this.orderDatasource.updateStatus(data);
  }

  async assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void> {
    return this.orderDatasource.assignOrderToEmployee(data);
  }

  async unassignOrder(orderId: IntegerId): Promise<void> {
    return this.orderDatasource.unassignOrder(orderId);
  }
}
