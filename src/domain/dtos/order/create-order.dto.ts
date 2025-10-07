import { IntegerId, UUID, FutureDate } from "../../value-object";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  private constructor(
    public customerId: UUID,
    public customerAddressId: IntegerId,
    public orderItems: CreateOrderItemDto[],
    public userId: UUID,
    public scheduledDate?: FutureDate,
    public deliveryNotes?: string,
    public notes?: string
  ) {}

  public static create(
    object: { [key: string]: any },
    userId: string
  ): [error?: string, dto?: CreateOrderDto] {
    const {
      customer_id,
      address_id,
      scheduled_date,
      delivery_notes,
      notes,
      order_items,
    } = object;

    if (!customer_id) return ["El ID del cliente es requerido"];

    if (!address_id) return ["El ID de la dirección es requerido"];

    if (!userId) return ["El ID del usuario es requerido"];

    if (!Array.isArray(order_items) || order_items.length === 0) {
      return ["Debe agregar al menos un producto al pedido"];
    }

    if (delivery_notes !== undefined && typeof delivery_notes !== "string") {
      return ["Las notas de entrega deben ser texto"];
    }

    if (notes !== undefined && typeof notes !== "string") {
      return ["Las notas deben ser texto"];
    }

    if (delivery_notes && delivery_notes.trim().length > 1000) {
      return ["Las notas de entrega no pueden exceder 1000 caracteres"];
    }

    if (notes && notes.trim().length > 1000) {
      return ["Las notas no pueden exceder 1000 caracteres"];
    }

    const orderItemDtos: CreateOrderItemDto[] = [];

    for (const item of order_items) {
      const [error, itemDto] = CreateOrderItemDto.create(item);
      if (error) return [`Ocurrió un error al agregar un producto`];
      orderItemDtos.push(itemDto!);
    }

    try {
      const customerId = UUID.create(customer_id);
      const addressId = IntegerId.create(address_id);
      const createdById = UUID.create(userId);

      const scheduledDate = scheduled_date
        ? FutureDate.create(scheduled_date)
        : undefined;

      const normalizedDeliveryNotes =
        delivery_notes && delivery_notes.trim().length > 0
          ? delivery_notes.trim()
          : undefined;

      const normalizedNotes =
        notes && notes.trim().length > 0 ? notes.trim() : undefined;

      return [
        undefined,
        new CreateOrderDto(
          customerId,
          addressId,
          orderItemDtos,
          createdById,
          scheduledDate,
          normalizedDeliveryNotes,
          normalizedNotes
        ),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
