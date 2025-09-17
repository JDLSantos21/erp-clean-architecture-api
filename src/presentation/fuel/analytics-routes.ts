import Router, { Router as RouterType } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { FuelAnalyticsController } from "./analytics-controller";
import { FuelAnalyticsRepositoryImpl } from "../../infrastructure/repositories/fuel-analytics.repository.impl";
import { FuelAnalyticsDatasourceImpl } from "../../infrastructure/datasources/fuel-analytics.datasource.impl";

export class FuelAnalyticsRoutes {
  static get routes(): RouterType {
    const router = Router();

    const fuelAnalyticsDatasource = new FuelAnalyticsDatasourceImpl();
    const fuelAnalyticsRepository = new FuelAnalyticsRepositoryImpl(
      fuelAnalyticsDatasource
    );
    const controller = new FuelAnalyticsController(fuelAnalyticsRepository);

    router.use(AuthMiddleware.validateJWT);
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
