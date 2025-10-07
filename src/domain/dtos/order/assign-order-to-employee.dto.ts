import { IntegerId, UUID } from "../../value-object";

export class AssignOrderToEmployeeDto {
  private constructor(public orderId: IntegerId, public userId: UUID) {}

  public static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: AssignOrderToEmployeeDto] {
    const { order_id, user_id } = object;

    if (order_id === undefined || order_id === null) {
      return ["El ID del pedido es requerido"];
    }

    if (user_id === undefined || user_id === null) {
      return ["El ID del empleado es requerido"];
    }

    try {
      const orderId = IntegerId.create(order_id);
      const userId = UUID.create(user_id);
      return [undefined, new AssignOrderToEmployeeDto(orderId, userId)];
    } catch (error: any) {
      return [error.message];
    }
  }
}
