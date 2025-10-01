import Router, { Router as RouterType } from "express";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";
import { FuelController } from "./controller";
import { DIContainer } from "../../infrastructure";

export class FuelRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<FuelController>("FuelController");

    router.use(AuthMiddleware.validateJWT);
    router.use(PermissionMiddleware.elevateRole);

    router.post("/consumption", controller.createFuelConsumption);
    router.get("/consumption", controller.findAllFuelConsumptions);
    router.delete("/consumption/:id", controller.deleteFuelConsumption);
    router.patch("/consumption/:id", controller.updateFuelConsumption);
    router.post("/tank", controller.createFuelTank);
    router.get("/tank", controller.getTankCurrentStatus);
    router.post("/tank-refill", controller.createFuelTankRefill);
    router.get("/tank-refill", controller.findAllTankRefills);
    router.get("/tank-refill/:id", controller.findTankRefillById);
    router.post("/tank/reset", controller.resetFuelTankLevel);

    return router;
  }
}
