import { Prisma, PrismaClient } from "@prisma/client";
import {
  AssignOrderToEmployeeDto,
  CacheService,
  CreateOrderDto,
  CustomError,
  FilterParams,
  IntegerId,
  Logger,
  Order,
  OrderDatasource,
  OrderQueryDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from "../../domain";
import { buildWhere, OrderMapper } from "../mappers";
import { CacheInvalidator, CacheKeyBuilder, CacheTTL } from "../utils";

export class OrderDatasourceImpl extends OrderDatasource {
  private static readonly ORDER_INCLUDE: Prisma.OrderInclude = {
    statusHistory: {
      orderBy: { createdAt: "desc" },
    },
    orderItems: {
      include: {
        product: true,
      },
    },
    customer: {
      include: {
        addresses: true,
        phones: true,
      },
    },
    customerAddress: true,
    createdByUser: true,
    assignedToUser: true,
  };

  private readonly cacheInvalidator: CacheInvalidator;

  private invalidateOrderEntityCache(id: number) {
    return Promise.all([
      this.cacheInvalidator.invalidateEntity("order", id),
      this.cacheInvalidator.invalidateLists("order"),
      this.cacheInvalidator.invalidateQueries("order"),
    ]);
  }

  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService
  ) {
    super();
    this.cacheInvalidator = new CacheInvalidator(cacheService);
  }

  async create(
    data: CreateOrderDto & { trackingCode: string }
  ): Promise<Order> {
    try {
      const createdOrderId = await this.prisma.$transaction(async (prisma) => {
        const { orderItems, mainOrderInfo } =
          OrderMapper.OrderFromDtoToPersistence(data);

        const createdOrder = await prisma.order.create({
          data: mainOrderInfo,
        });

        await prisma.orderItem.createMany({
          data: orderItems.map((item) => ({
            ...item,
            orderId: createdOrder.id,
          })),
        });

        await prisma.orderStatusHistory.create({
          data: {
            description: "Orden creada",
            userId: data.userId.value,
            orderId: createdOrder.id,
            status: "PENDIENTE",
          },
        });

        return createdOrder.id;
      });

      const createdOrder = await this.prisma.order.findUnique({
        where: { id: createdOrderId },
        include: OrderDatasourceImpl.ORDER_INCLUDE,
      });

      if (!createdOrder)
        throw CustomError.notFound(
          "El pedido no fue encontrado, despues de su creación"
        );

      await Promise.all([
        this.cacheInvalidator.invalidateLists("order"),
        this.cacheInvalidator.invalidateQueries("order"),
      ]);

      return OrderMapper.toDomain(createdOrder);
    } catch (error) {
      Logger.error("Order datasource - create: ", error);
      throw CustomError.internalServer("Error al crear el pedido");
    }
  }

  async update(id: IntegerId, data: UpdateOrderDto): Promise<Order> {
    try {
      const { orderItems, orderId, ...dataForUpdate } =
        OrderMapper.orderUpdateFromDtoToPersistence(data);

      const updatedOrder = await this.prisma.$transaction(async (prisma) => {
        if (orderItems && orderItems.length > 0) {
          await prisma.orderItem.deleteMany({
            where: { orderId: id.value },
          });

          await prisma.orderItem.createMany({
            data: orderItems.map((item) => ({
              ...item,
              orderId: id.value,
            })),
          });
        }

        return prisma.order.update({
          where: { id: id.value },
          data: dataForUpdate,
        });
      });

      await this.invalidateOrderEntityCache(id.value);

      return OrderMapper.toDomain(updatedOrder);
    } catch (error) {
      Logger.error("Order datasource - update: ", error);
      throw CustomError.internalServer("Error al actualizar el pedido");
    }
  }

  async delete(id: IntegerId): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: id.value },
        data: { isActive: false },
      });

      await this.invalidateOrderEntityCache(id.value);
    } catch (error) {
      Logger.error("Order datasource - delete: ", error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error al eliminar el pedido");
    }
  }

  async list(
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const { filters, limit, skip } = filterParams;

      const searchTermFields = [
        "trackingCode",
        "customer.businessName",
        "customer.representativeName",
      ];

      const dateRangeField = "orderDate";
      const where = buildWhere(filters, searchTermFields, dateRangeField, {
        enumFields: ["status"],
      });

      console.log("List Order Filters: ", filters);
      console.log("List Order Where clause: ", where);

      const cacheKey = CacheKeyBuilder.list("order", filterParams);

      const cached = await this.cacheService.get<{
        orders: Order[];
        total: number;
      }>(cacheKey);

      if (cached) {
        return {
          orders: cached.orders.map((order) => OrderMapper.toDomain(order)),
          total: cached.total,
        };
      }

      const [orders, total] = await Promise.all([
        await this.prisma.order.findMany({
          where,
          take: limit,
          skip,
          include: OrderDatasourceImpl.ORDER_INCLUDE,
        }),
        await this.prisma.order.count({ where }),
      ]);

      if (orders.length !== 0) {
        await this.cacheService.set(
          cacheKey,
          { orders, total },
          CacheTTL.DYNAMIC
        );
      }

      return {
        orders: orders.map((order) => OrderMapper.toDomain(order)),
        total,
      };
    } catch (error) {
      Logger.error("Order datasource - list: ", error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Error al listar los pedidos");
    }
  }

  async findOne(id: IntegerId): Promise<Order> {
    try {
      const cacheKey = CacheKeyBuilder.entity("order", id.value);
      const cachedOrder = await this.cacheService.get<Order>(cacheKey);

      if (cachedOrder) return OrderMapper.toDomain(cachedOrder);

      const orderData = await this.prisma.order.findUnique({
        where: { id: id.value },
        include: OrderDatasourceImpl.ORDER_INCLUDE,
      });

      if (!orderData) throw CustomError.notFound("El pedido no fue encontrado");
      await this.cacheService.set(cacheKey, orderData, CacheTTL.DYNAMIC);

      return OrderMapper.toDomain(orderData);
    } catch (error) {
      Logger.error("Order datasource - findOne: ", error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer("Ocurrió un error al buscar el pedido");
    }
  }

  async findOneByTrackingCode(trackingCode: string): Promise<Order> {
    try {
      const cacheKey = CacheKeyBuilder.query(
        "order",
        "byTrackingCode",
        trackingCode
      );
      const cachedOrder = await this.cacheService.get<Order>(cacheKey);
      if (cachedOrder) return OrderMapper.toDomain(cachedOrder);

      const order = await this.prisma.order.findUnique({
        where: { trackingCode },
        include: OrderDatasourceImpl.ORDER_INCLUDE,
      });

      if (!order) throw CustomError.notFound("El pedido no fue encontrado");
      await this.cacheService.set(cacheKey, order, CacheTTL.DYNAMIC);
      return OrderMapper.toDomain(order);
    } catch (error) {
      Logger.error("Order datasource - findOneByTrackingCode: ", error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(
        "Ocurrió un error al buscar el pedido por código de seguimiento"
      );
    }
  }

  async trackingCodeExists(trackingCode: string): Promise<boolean> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { trackingCode },
        select: { id: true },
      });
      return !!order;
    } catch (error) {
      throw CustomError.internalServer(
        "Ocurrió un error al verificar el código de seguimiento"
      );
    }
  }

  async updateStatus(data: UpdateOrderStatusDto): Promise<void> {
    const { status: statusData, userId, orderId } = data;
    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.order.update({
          where: { id: orderId.value },
          data: { status: statusData.name },
        });

        await prisma.orderStatusHistory.create({
          data: {
            orderId: orderId.value,
            userId: userId.value,
            status: statusData.name,
            description: statusData.description,
          },
        });
      });

      await this.invalidateOrderEntityCache(orderId.value);
    } catch (error) {
      throw CustomError.internalServer(
        "Error al actualizar el estado del pedido"
      );
    }
  }

  async assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: data.orderId.value },
        data: { assignedToId: data.userId.value },
      });
      await this.invalidateOrderEntityCache(data.orderId.value);
    } catch (error) {
      Logger.error("Order datasource - assignOrderToEmployee: ", error);
      throw CustomError.internalServer("Error al asignar el pedido");
    }
  }

  async unassignOrder(orderId: IntegerId): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: orderId.value },
        data: { assignedToId: null },
      });
      await this.invalidateOrderEntityCache(orderId.value);
    } catch (error) {
      Logger.error("Order datasource - unassignOrder: ", error);
      throw CustomError.internalServer("Error al desasignar el pedido");
    }
  }

  async findOrdersByCustomerId(
    customerId: string,
    filterParams: FilterParams<OrderQueryDto>
  ): Promise<Order[]> {
    throw new Error("Method not implemented.");
  }
}
