import { CreateOrderDto } from "../../dtos";
import { Order } from "../../entities";
import { CustomError } from "../../errors";
import { CustomerRepository, OrderRepository } from "../../repositories";
import { TrackingCodeGenerator } from "../../services";

interface CreateOrderUseCase {
  execute(data: CreateOrderDto): Promise<Order>;
}

export class CreateOrder implements CreateOrderUseCase {
  private static readonly MAX_TRACKING_CODE_ATTEMPTS = 10;

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly trackingCodeGenerator: TrackingCodeGenerator
  ) {}

  async execute(data: CreateOrderDto): Promise<Order> {
    const customer = await this.customerRepository.findById(
      data.customerId.value
    );
    if (!customer) throw CustomError.notFound("El cliente no existe");
    const { addresses, isActive } = customer;

    if (!addresses || addresses.length === 0)
      throw CustomError.notFound("El cliente no tiene direcciones registradas");
    if (!isActive) throw CustomError.forbidden("El cliente no está activo");
    if (!addresses!.find((a) => a.id === data.customerAddressId.value))
      throw CustomError.notFound("La dirección del cliente no existe");

    // Generar trackingCode único
    const trackingCode = await this.generateUniqueTrackingCode();

    return await this.orderRepository.create({ ...data, trackingCode });
  }

  private async generateUniqueTrackingCode(): Promise<string> {
    const maxAttempts = CreateOrder.MAX_TRACKING_CODE_ATTEMPTS;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const trackingCode = this.trackingCodeGenerator.generate();

      const exists = await this.orderRepository.trackingCodeExists(
        trackingCode.value
      );

      if (!exists) return trackingCode.value;
    }

    throw CustomError.internalServer(
      "No se pudo generar un código de tracking único después de múltiples intentos"
    );
  }
}
