import { OrderStatus } from "../entities";

export interface OrderStatusUpdate {
  status: OrderStatus;
  description?: string;
}
