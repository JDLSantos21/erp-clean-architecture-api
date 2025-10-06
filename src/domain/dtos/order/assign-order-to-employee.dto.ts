import { IntegerId, UUID } from "../../value-object";

export class AssignOrderToEmployeeDto {
  private constructor(public orderId: IntegerId, public employeeId: UUID) {}

  public static create(object: {
    [key: string]: any;
  }): [error?: string, dto?: AssignOrderToEmployeeDto] {
    const { order_id, employee_id } = object;

    if (order_id === undefined || order_id === null) {
      return ["El ID del pedido es requerido"];
    }

    if (employee_id === undefined || employee_id === null) {
      return ["El ID del empleado es requerido"];
    }

    try {
      const orderId = IntegerId.create(order_id);
      const employeeId = UUID.create(employee_id);
      return [undefined, new AssignOrderToEmployeeDto(orderId, employeeId)];
    } catch (error: any) {
      return [error.message];
    }
  }
}
