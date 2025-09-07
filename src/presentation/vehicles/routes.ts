import Router, { Router as RouterType } from "express";
import { VehicleController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import {
  VehicleDatasourceImpl,
  VehicleRepositoryImpl,
} from "../../infrastructure";

export class VehicleRoutes {
  static get routes(): RouterType {
    const router = Router();

    const vehicleRepository = new VehicleRepositoryImpl(
      new VehicleDatasourceImpl()
    );
    const controller = new VehicleController(vehicleRepository);

    const { isAdmin, elevateRole } = PermissionMiddleware;

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
