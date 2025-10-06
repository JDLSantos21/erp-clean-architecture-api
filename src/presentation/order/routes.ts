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
    router.patch("/:id", controller.updateOrder);
    router.get("/:id", controller.getOrderById);
    return router;
  }
}
