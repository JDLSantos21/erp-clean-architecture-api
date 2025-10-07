import Router, { Router as RouterType } from "express";
import { DIContainer } from "../../infrastructure";
import { OrderController } from "./controller";
import { AuthMiddleware } from "../middlewares";

export class OrderRoutes {
  static get routes(): RouterType {
    const router = Router();
    const container = DIContainer.getInstance();
    const controller = container.resolve<OrderController>("OrderController");
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);

    router.post("/", controller.createOrder);
    router.get("/", controller.listOrders);
    router.patch("/:id", controller.updateOrder);
    router.get("/:id", controller.getOrderById);
    router.post("/:id/assign", controller.assignOrderToEmployee);
    router.post("/:id/clear-assignation", controller.clearOrderAssignation);
    router.post("/:id/status", controller.updateOrderStatus);
    router.get("/tracking/:trackingCode", controller.findOrderByTrackingCode);
    return router;
  }
}
