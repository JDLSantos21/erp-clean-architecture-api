import {
  AssignOrderToEmployee,
  AssignOrderToEmployeeDto,
  ClearOrderAssignation,
  CreateOrder,
  CreateOrderDto,
  CustomError,
  IntegerId,
  OrderQueryDto,
  OrderRepository,
  TrackingCode,
  UpdateOrder,
  UpdateOrderDto,
  UpdateOrderStatus,
  UpdateOrderStatusDto,
} from "../../domain";
import { OrderResponseDto } from "../dtos/order";
import { BaseController } from "../shared/base.controller";
import { Request, Response } from "express";

export class OrderController extends BaseController {
  constructor(
    private readonly createOrderUseCase: CreateOrder,
    private readonly updateOrderUseCase: UpdateOrder,
    private readonly updateOrderStatusUseCase: UpdateOrderStatus,
    private readonly clearOrderAssignationUseCase: ClearOrderAssignation,
    private readonly assignOrderUseCase: AssignOrderToEmployee,
    private readonly orderRepository: OrderRepository
  ) {
    super();
  }

  createOrder = async (req: Request, res: Response) => {
    const user = req.user;
    const [error, dto] = CreateOrderDto.create(req.body, user.id);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      const order = await this.createOrderUseCase.execute(dto!);
      const orderResponse = OrderResponseDto.fromEntity(order);
      this.handleSuccess(res, orderResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateOrder = async (req: Request, res: Response) => {
    const [error, dto] = UpdateOrderDto.create({
      ...req.body,
      orderId: Number(req.params.id),
    });

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      const order = await this.updateOrderUseCase.execute(dto!.orderId, dto!);
      const orderResponse = OrderResponseDto.fromEntity(order);
      this.handleSuccess(res, orderResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  getOrderById = async (req: Request, res: Response) => {
    const id = IntegerId.create(Number(req.params.id));

    try {
      const order = await this.orderRepository.findOne(id);
      const orderResponse = OrderResponseDto.fromEntity(order);
      this.handleSuccess(res, orderResponse, req);
    } catch (error) {
      console.log(error);
      this.handleError(error, res, req);
    }
  };

  listOrders = async (req: Request, res: Response) => {
    const [error, dto] = OrderQueryDto.create(req.query);

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    const { limit, page, ...filters } = dto!;
    try {
      const filterParams = { filters, limit, skip: (page - 1) * limit };
      const { orders, total } = await this.orderRepository.list(filterParams);
      const ordersResponse = orders.map(OrderResponseDto.fromEntity);
      const pagination = { total, page, limit };
      this.handleSuccessWithPagination(res, ordersResponse, pagination, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  findOrderByTrackingCode = async (req: Request, res: Response) => {
    const trackingCode = req.params.trackingCode;

    const isValid = TrackingCode.isValid(trackingCode);

    if (!isValid) {
      const customError = CustomError.badRequest(
        "El código de rastreo no es válido"
      );
      this.handleError(customError, res, req);
      return;
    }

    try {
      const order = await this.orderRepository.findOneByTrackingCode(
        trackingCode
      );
      const orderResponse = OrderResponseDto.fromEntity(order);
      this.handleSuccess(res, orderResponse, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  assignOrderToEmployee = async (req: Request, res: Response) => {
    const order_id = req.params.id;
    const [error, dto] = AssignOrderToEmployeeDto.create({
      ...req.body,
      order_id: Number(order_id),
    });

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      const result = await this.assignOrderUseCase.execute(dto!);
      this.handleSuccess(res, result, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  clearOrderAssignation = async (req: Request, res: Response) => {
    const orderId = IntegerId.create(Number(req.params.id));
    try {
      await this.clearOrderAssignationUseCase.execute(orderId);
      this.handleSuccess(res, { message: "Asignación eliminada" }, req);
    } catch (error) {
      this.handleError(error, res, req);
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const [error, dto] = UpdateOrderStatusDto.create({
      ...req.body,
      order_id: Number(req.params.id),
      user_id: userId,
    });

    if (error) {
      const customError = CustomError.badRequest(error);
      this.handleError(customError, res, req);
      return;
    }

    try {
      await this.updateOrderStatusUseCase.execute(dto!);
      this.handleSuccess(
        res,
        { message: "Estado del pedido actualizado" },
        req
      );
    } catch (error) {
      this.handleError(error, res, req);
    }
  };
}
