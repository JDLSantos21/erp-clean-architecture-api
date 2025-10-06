import {
  CreateOrder,
  CreateOrderDto,
  CustomError,
  IntegerId,
  OrderRepository,
  UpdateOrder,
  UpdateOrderDto,
} from "../../domain";
import { OrderResponseDto } from "../dtos/order";
import { BaseController } from "../shared/base.controller";
import { Request, Response } from "express";

export class OrderController extends BaseController {
  constructor(
    private readonly createOrderUseCase: CreateOrder,
    private readonly updateOrderUseCase: UpdateOrder,
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
      console.log(error);
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
      this.handleError(error, res, req);
    }
  };
}
