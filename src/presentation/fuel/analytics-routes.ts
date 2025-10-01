import Router, { Router as RouterType } from "express";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";
import { FuelAnalyticsController } from "./analytics-controller";

import { DIContainer } from "../../infrastructure";

export class FuelAnalyticsRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<FuelAnalyticsController>(
      "FuelAnalyticsController"
    );
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);
    router.use(PermissionMiddleware.elevateRole);

    // Dashboard Summary - métricas principales
    router.get("/dashboard/summary", controller.getDashboardSummary);

    // Dashboard Metrics - métricas por período
    router.get("/dashboard/metrics", controller.getDashboardMetrics);

    // Vehicle-specific metrics
    router.get(
      "/dashboard/vehicle/:vehicleId/metrics",
      controller.getVehicleMetrics
    );

    return router;
  }
}
