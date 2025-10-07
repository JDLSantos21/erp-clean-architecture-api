import { OrderStatus } from "../entities";

export interface OrderStatusUpdate {
  name: OrderStatus;
  description?: string;
  userId: string;
}
