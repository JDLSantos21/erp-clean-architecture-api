import Router, { Router as RouterType } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { FuelController } from "./controller";
import { FuelDatasourceImpl, FuelRepositoryImpl } from "../../infrastructure";

export class FuelRoutes {
  static get routes(): RouterType {
    const router = Router();

    const fuelRepository = new FuelRepositoryImpl(new FuelDatasourceImpl());
    const controller = new FuelController(fuelRepository);

    const { elevateRole } = PermissionMiddleware;

    router.use(AuthMiddleware.validateJWT);

    router.use(PermissionMiddleware.elevateRole);

    router.post("/consumption", controller.createFuelConsumption);
    router.post("/tank", controller.createFuelTank);

    // Public routes

    return router;
  }
}
