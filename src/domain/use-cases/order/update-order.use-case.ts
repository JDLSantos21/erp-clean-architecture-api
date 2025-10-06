import { UpdateOrderDto } from "../../dtos";
import { Order } from "../../entities";
import { CustomError } from "../../errors";
import { OrderRepository } from "../../repositories";
import { IntegerId } from "../../value-object";

interface UpdateOrderUseCase {
  execute(orderId: IntegerId, data: UpdateOrderDto): Promise<Order>;
}

export class UpdateOrder implements UpdateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: IntegerId, data: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) throw CustomError.notFound("El pedido a actualizar no existe");

    return await this.orderRepository.update(orderId, data);
  }
}
