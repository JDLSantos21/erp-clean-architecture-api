import { CreateOrderDto } from "../../dtos";
import { Order } from "../../entities";
import { CustomError } from "../../errors";
import { CustomerRepository, OrderRepository } from "../../repositories";

interface CreateOrderUseCase {
  execute(data: CreateOrderDto): Promise<Order>;
}

export default class CreateOrder implements CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository
  ) {}
  async execute(data: CreateOrderDto): Promise<Order> {
    const promises = [this.customerRepository.findById(data.customerId.value)];

    const [customer] = await Promise.all(promises);

    if (!customer) throw CustomError.notFound("El cliente no existe");

    if (!customer.isActive)
      throw CustomError.forbidden("El cliente no está activo");

    if (
      !customer.addresses!.find((a) => a.id === data.customerAddressId.value)
    ) {
      throw CustomError.notFound("La dirección del cliente no existe");
    }

    const trackingCode = await this.orderRepository.generateTrackingCode();

    const order = await this.orderRepository.create({ ...data, trackingCode });

    return order;
  }
}
