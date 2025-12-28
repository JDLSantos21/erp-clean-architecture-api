import { Router } from "express";
import { TelemetryController } from "./controller";

export class TelemetryRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TelemetryController();

    router.post("/sync", controller.syncFleet);
    router.get("/nearby", controller.getNearbyVehicles);

    return router;
  }
}
