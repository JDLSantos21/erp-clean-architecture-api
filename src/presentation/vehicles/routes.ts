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

    const { elevateRole } = PermissionMiddleware;

    router.use(AuthMiddleware.validateJWT);
    router.use(PermissionMiddleware.elevateRole);

    // Public routes
    router.post("/", controller.createVehicle);
    router.get("/", controller.getVehicles);
    router.put("/:id", controller.updateVehicle);
    router.delete("/:id", elevateRole, controller.deleteVehicle);
    router.get("/:id", controller.getVehicleById);

    return router;
  }
}
