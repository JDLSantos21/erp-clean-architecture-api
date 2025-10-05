import { OrderStatusArray } from "../../constants";
import { OrderStatusUpdate } from "../../types";
import { IntegerId } from "../../value-object";

export class UpdateOrderStatusDto {
  constructor(public order_id: IntegerId, public status: OrderStatusUpdate) {}

  static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: UpdateOrderStatusDto] {
    const { order_id, status } = object;

    if (!order_id) return ["El ID del pedido es requerido", undefined];
    if (!status) return ["El estado es requerido", undefined];

    if (typeof status !== "object" || Array.isArray(status)) {
      return ["El formato del estado es inválido", undefined];
    }

    if (!status.status) {
      return ["El campo 'status' es requerido", undefined];
    }

    if (!OrderStatusArray.includes(status.status)) {
      return [
        `El estado debe ser uno de los siguientes: ${OrderStatusArray.join(
          ", "
        )}`,
        undefined,
      ];
    }

    if (status.description) {
      if (typeof status.description !== "string") {
        return ["La descripción del estado debe ser un texto", undefined];
      }

      if (status.description.length > 500) {
        return ["La descripción no puede exceder 500 caracteres", undefined];
      }

      status.description = status.description.trim();
      if (status.description.length === 0) delete status.description;
    }

    try {
      const orderIdVO = IntegerId.create(order_id);
      const dto = new UpdateOrderStatusDto(orderIdVO, status);
      return [undefined, dto];
    } catch (error: any) {
      return [error.message, undefined];
    }
  }
}
