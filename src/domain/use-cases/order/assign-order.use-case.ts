import { AssignOrderToEmployeeDto } from "../../dtos";
import { CustomError } from "../../errors";
import { AuthRepository, OrderRepository } from "../../repositories";

interface AssignOrderToEmployeeUseCase {
  execute(data: AssignOrderToEmployeeDto): Promise<void>;
}

export class AssignOrderToEmployee implements AssignOrderToEmployeeUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly authRepository: AuthRepository
  ) {}
  async execute(data: AssignOrderToEmployeeDto): Promise<void> {
    const [order, user] = await Promise.all([
      this.orderRepository.findOne(data.orderId),
      this.authRepository.findById(data.userId.value),
    ]);

    if (!order) throw CustomError.notFound("El pedido seleccionado no existe");

    if (order.isAssigned())
      throw CustomError.conflict("El pedido ya esta asignado");

    if (!order.canBeAssigned())
      throw CustomError.conflict("El estado del pedido no permite asignación");

    if (!user) throw CustomError.notFound("El usuario seleccionado no existe");

    return this.orderRepository.assignOrderToEmployee(data);
  }
}
