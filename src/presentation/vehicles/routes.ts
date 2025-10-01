import Router, { Router as RouterType } from "express";
import { VehicleController } from "./controller";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";
import { DIContainer } from "../../infrastructure";

export class VehicleRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller =
      container.resolve<VehicleController>("VehicleController");
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    const { supervision, administration } = PermissionMiddleware;

    router.use(authMiddleware.validateJWT);

    // Public routes
    router.post("/", supervision, controller.createVehicle);
    router.get("/", controller.getVehicles);
    router.put("/:id", controller.updateVehicle);
    router.delete("/:id", administration, controller.deleteVehicle);
    router.get("/:id", controller.getVehicleById);

    return router;
  }
}
