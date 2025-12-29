import { AssignOrderToEmployeeDto } from "../../dtos";
import { CustomError } from "../../errors";
import { EmployeeRepository, OrderRepository } from "../../repositories";
import { IWssService } from "../../services";

interface AssignOrderToEmployeeUseCase {
  execute(data: AssignOrderToEmployeeDto): Promise<void>;
}

export class AssignOrderToEmployee implements AssignOrderToEmployeeUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly wssService: IWssService
  ) {}
  async execute(data: AssignOrderToEmployeeDto): Promise<void> {
    const [order, employee] = await Promise.all([
      this.orderRepository.findOne(data.orderId),
      this.employeeRepository.findById(data.employeeId.value),
    ]);

    if (!order) throw CustomError.notFound("El pedido seleccionado no existe");

    if (!employee)
      throw CustomError.notFound("El empleado seleccionado no existe");

    if (employee.position !== "CHOFER")
      throw CustomError.badRequest("El empleado seleccionado no es un chofer");

    if (order.isAssigned())
      throw CustomError.conflict("El pedido ya esta asignado");

    if (!order.canBeAssigned())
      throw CustomError.conflict("El estado del pedido no permite asignación");

    await this.orderRepository.assignOrderToEmployee(data);

    if (employee.userId) {
      this.wssService.sendMessage("order:assigned", {
        userId: employee.userId,
        orderId: data.orderId.value,
      });
    }

    this.wssService.sendMessage("order:updated", { id: data.orderId.value });
  }
}
