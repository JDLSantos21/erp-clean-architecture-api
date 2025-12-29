import { CustomError } from "../..";
import { OrderRepository } from "../../repositories";
import { IntegerId } from "../../value-object";
import { IWssService } from "../../services";

interface ClearOrderAssignationUseCase {
  execute(orderId: IntegerId): Promise<void>;
}

export class ClearOrderAssignation implements ClearOrderAssignationUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly wssService: IWssService
  ) {}

  async execute(orderId: IntegerId): Promise<void> {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) throw CustomError.notFound("El pedido seleccionado no existe");

    if (!order.isAssigned())
      throw CustomError.badRequest("El pedido no está asignado");

    //TODO: revisar, deja desasignar un pedido entregado
    if (!order.canBeUnassigned())
      throw CustomError.badRequest(
        "El pedido no puede ser desasignado en su estado actual"
      );

    await this.orderRepository.unassignOrder(orderId);
    this.wssService.sendMessage("order:updated", { id: orderId.value });
  }
}
