import { UpdateOrderDto } from "../../dtos";
import { Order } from "../../entities";
import { CustomError } from "../../errors";
import { OrderRepository } from "../../repositories";
import { IntegerId } from "../../value-object";
import { IWssService } from "../../services";

interface UpdateOrderUseCase {
  execute(orderId: IntegerId, data: UpdateOrderDto): Promise<Order>;
}

export class UpdateOrder implements UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly wssService: IWssService
  ) {}

  async execute(orderId: IntegerId, data: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) throw CustomError.notFound("El pedido a actualizar no existe");

    const updatedOrder = await this.orderRepository.update(orderId, data);

    this.wssService.sendMessage("order:updated", { id: updatedOrder.id });

    return updatedOrder;
  }
}
