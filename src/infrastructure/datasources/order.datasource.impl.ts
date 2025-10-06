import { Prisma, PrismaClient } from "@prisma/client";
import {
  AssignOrderToEmployeeDto,
  CreateOrderDto,
  CustomError,
  FilterParams,
  IntegerId,
  Order,
  OrderDatasource,
  OrderQueryDto,
  OrderStatus,
  OrderStatusUpdate,
  UpdateOrderDto,
} from "../../domain";
import { buildWhere, OrderMapper } from "../mappers";

export class OrderDatasourceImpl extends OrderDatasource {
  private static readonly ORDER_INCLUDE: Prisma.OrderInclude = {
    statusHistory: {
      orderBy: { changedAt: "desc" },
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

  constructor(private readonly prisma: PrismaClient) {
    super();
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

        prisma.orderItem.createMany({
          data: orderItems.map((item) => ({
            ...item,
            orderId: createdOrder.id,
          })),
        });

        prisma.orderStatusHistory.create({
          data: {
            description: "Orden creada",
            changedBy: data.createdById.value,
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

      return OrderMapper.toDomain(createdOrder);
    } catch (error) {
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

      return OrderMapper.toDomain(updatedOrder);
    } catch (error) {
      throw CustomError.internalServer("Error al actualizar el pedido");
    }
  }

  async delete(id: IntegerId): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: id.value },
        data: { isActive: false },
      });
    } catch (error) {
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
      const where = buildWhere(filters, searchTermFields, dateRangeField);

      const [orders, total] = await Promise.all([
        await this.prisma.order.findMany({
          where,
          take: limit,
          skip,
          include: OrderDatasourceImpl.ORDER_INCLUDE,
        }),
        await this.prisma.order.count({ where }),
      ]);

      return { orders: orders.map(OrderMapper.toDomain), total };
    } catch (error) {
      throw CustomError.internalServer("Error al listar los pedidos");
    }
  }

  async findOne(id: IntegerId): Promise<Order> {
    try {
      const orderData = await this.prisma.order.findUnique({
        where: { id: id.value },
        include: OrderDatasourceImpl.ORDER_INCLUDE,
      });

      if (!orderData) throw CustomError.notFound("El pedido no fue encontrado");

      return OrderMapper.toDomain(orderData);
    } catch (error) {
      throw CustomError.internalServer("Ocurrió un error al buscar el pedido");
    }
  }

  async findOneByTrackingCode(trackingCode: string): Promise<Order> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { trackingCode },
        include: OrderDatasourceImpl.ORDER_INCLUDE,
      });

      if (!order) throw CustomError.notFound("El pedido no fue encontrado");

      return OrderMapper.toDomain(order);
    } catch (error) {
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

  async updateStatus(id: IntegerId, status: OrderStatusUpdate): Promise<void> {
    try {
      await this.prisma.orderStatusHistory.create({
        data: {
          orderId: id.value,
          changedBy: status.changedById,
          description: status.description,
          status: status.status,
        },
      });
    } catch (error) {
      throw CustomError.internalServer(
        "Error al actualizar el estado del pedido"
      );
    }
  }

  async getOrderCurrentStatus(id: IntegerId): Promise<OrderStatus | null> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: id.value },
        select: { statusHistory: { orderBy: { changedAt: "desc" }, take: 1 } },
      });

      if (!order || order.statusHistory.length === 0) return null;

      return order.statusHistory[0].status;
    } catch (error) {
      throw CustomError.internalServer(
        "Error al obtener el estado actual del pedido"
      );
    }
  }

  async assignOrderToEmployee(data: AssignOrderToEmployeeDto): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: data.orderId.value },
        data: { assignedToId: data.employeeId.value },
      });
    } catch (error) {
      throw CustomError.internalServer("Error al asignar el pedido");
    }
  }

  async unassignOrder(orderId: IntegerId): Promise<void> {
    try {
      await this.prisma.order.update({
        where: { id: orderId.value },
        data: { assignedToId: null },
      });
    } catch (error) {
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
