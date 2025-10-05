import { IntegerId } from "../../value-object";

export class CreateOrderItemDto {
  private constructor(
    public productId: IntegerId,
    public requestedQuantity: number,
    public notes?: string
  ) {}

  public static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: CreateOrderItemDto] {
    const { product_id, requested_quantity, notes } = object;

    if (product_id === undefined || product_id === null) {
      return ["El ID del producto es requerido"];
    }

    if (requested_quantity === undefined || requested_quantity === null) {
      return ["La cantidad solicitada es requerida"];
    }

    if (typeof requested_quantity !== "number") {
      return ["La cantidad solicitada debe ser un número"];
    }

    if (!Number.isInteger(requested_quantity)) {
      return ["La cantidad solicitada debe ser un número entero"];
    }

    if (requested_quantity <= 0) {
      return ["La cantidad solicitada debe ser mayor a 0"];
    }

    if (requested_quantity > 10000) {
      return ["La cantidad solicitada no puede exceder 10,000 unidades"];
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") return ["Las notas deben ser texto"];
      const trimmedNotes = notes.trim();
      if (trimmedNotes.length > 500)
        return ["Las notas no pueden exceder 500 caracteres"];
    }

    try {
      const productId = IntegerId.create(product_id);

      const normalizedNotes =
        notes && notes.trim().length > 0 ? notes.trim() : undefined;

      return [
        undefined,
        new CreateOrderItemDto(productId, requested_quantity, normalizedNotes),
      ];
    } catch (error: any) {
      return [error.message];
    }
  }
}
