import { Router } from "express";
import { MaintenanceProcedureController } from "./maintenance-procedure.controller";
import { DIContainer } from "../../infrastructure";

const container = DIContainer.getInstance();
const controller = container.resolve<MaintenanceProcedureController>(
  "VehicleMaintenanceController"
);

export class MaintenanceRoutes {
  static get routes(): Router {
    const router = Router();

    // Rutas de Procedimientos de Mantenimiento
    router.post("/procedures", controller.create);
    router.get("/procedures", controller.getAll);
    router.put("/procedures/:id", controller.update);
    router.delete("/procedures/:id", controller.delete);

    // Rutas de Mantenimientos
    router.post("/maintenances", controller.createMaintenance);
    router.get("/maintenances", controller.getMaintenances);
    router.get("/maintenances/:id", controller.getMaintenanceById);
    router.put("/maintenances/:id/status", controller.updateMaintenanceStatus);

    // Rutas de Alertas
    router.post("/alerts/generate", controller.generateAlerts);
    router.get("/alerts", controller.getAlerts);
    router.put("/alerts/:id/read", controller.markAlertAsRead);
    router.delete("/alerts/:id", controller.dismissAlert);

    // Rutas de Reportes
    router.get("/reports/incomplete", controller.getIncompleteMaintenances);
    router.get("/reports/overdue", controller.getOverdueMaintenances);
    router.get("/reports/upcoming/:days", controller.getUpcomingMaintenances);

    // Rutas de Jobs/Automatización
    router.post(
      "/jobs/schedule-maintenances",
      controller.runMaintenanceScheduler
    );
    router.post("/jobs/generate-alerts", controller.runAlertsGenerator);
    router.delete("/jobs/clean-alerts", controller.cleanOldAlerts);

    // Rutas de Configuración de Schedules
    router.post("/setup/schedules", controller.setupMaintenanceSchedules);
    router.post("/setup/schedules/:vehicleId", controller.setupCustomSchedule);
    router.get("/setup/stats", controller.getScheduleStats);

    return router;
  }
}
