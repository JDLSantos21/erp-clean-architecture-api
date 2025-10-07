import { OrderStatus } from "@prisma/client";
import { UpdateOrderStatusDto } from "../../dtos";
import { OrderRepository } from "../../repositories";
import { CustomError } from "../../errors";

interface UpdateOrderStatusUseCase {
  execute(data: UpdateOrderStatusDto): Promise<void>;
}

export class UpdateOrderStatus implements UpdateOrderStatusUseCase {
  constructor(private orderRepository: OrderRepository) {}
  async execute(data: UpdateOrderStatusDto): Promise<void> {
    const order = await this.orderRepository.findOne(data.orderId);

    if (!order) throw CustomError.notFound("El pedido seleccionado no existe");

    if (data.status.name === order.getCurrentStatus())
      throw CustomError.forbidden(
        "No se puede cambiar el estado de un pedido a su estado actual"
      );

    if (order.isCancelled())
      throw CustomError.forbidden(
        "No se puede cambiar el estado de un pedido cancelado"
      );

    if (order.isDelivered())
      throw CustomError.forbidden(
        "No se puede cambiar el estado de un pedido entregado"
      );

    if (data.status.name === "ENTREGADO" && !order.isDispatched())
      throw CustomError.forbidden(
        "No se puede marcar como entregado un pedido que no está despachado"
      );

    if (data.status.name === "DESPACHADO" && !order.isAssigned())
      throw CustomError.forbidden(
        "No se puede marcar como despachado un pedido que no está asignado"
      );

    if (data.status.name === "PREPARANDO" && !order.isPending())
      throw CustomError.forbidden(
        "No se puede marcar como preparando un pedido que no está pendiente"
      );

    if (data.status.name === "PENDIENTE" && !order.isPreparing())
      throw CustomError.forbidden(
        "No se puede marcar como pendiente un pedido que no está preparando"
      );

    return await this.orderRepository.updateStatus(data);
  }
}
