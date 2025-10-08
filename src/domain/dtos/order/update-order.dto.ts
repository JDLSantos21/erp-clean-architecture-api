import { Validators } from "../../../config";
import { FutureDate, IntegerId } from "../../value-object";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class UpdateOrderDto {
  private constructor(
    public orderId: IntegerId,
    public orderItems?: CreateOrderItemDto[],
    public deliveryNotes?: string,
    public notes?: string,
    public scheduledDate?: FutureDate
  ) {}
  public static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: UpdateOrderDto] {
    const { orderId, order_items, delivery_notes, notes, scheduled_date } =
      object;

    if (
      !Validators.hasAtLeastOneField({
        order_items,
        delivery_notes,
        notes,
        scheduled_date,
      })
    ) {
      return ["Debe haber al menos un campo para actualizar", undefined];
    }

    if (orderId === undefined || orderId === null) {
      return ["El ID del pedido es requerido", undefined];
    }

    let orderItemsArray: CreateOrderItemDto[] = [];

    if (order_items !== undefined && order_items.length > 0) {
      if (!Array.isArray(order_items)) {
        return [
          "El formato de los productos del pedido es inválido",
          undefined,
        ];
      }

      for (const item of order_items) {
        const [error, itemDto] = CreateOrderItemDto.create(item);
        if (error)
          return [`Ocurrió un error al agregar un producto`, undefined];
        orderItemsArray.push(itemDto!);
      }
    }

    try {
      const orderIdVO = IntegerId.create(orderId);
      const scheduledDate = scheduled_date
        ? FutureDate.create(scheduled_date)
        : undefined;

      const dto = new UpdateOrderDto(
        orderIdVO,
        orderItemsArray.length > 0 ? orderItemsArray : undefined,
        delivery_notes?.trim() || undefined,
        notes?.trim() || undefined,
        scheduledDate
      );
      return [undefined, dto];
    } catch (error: Error | any) {
      return [error.message, undefined];
    }
  }
}
