import { Router } from "express";
import { PostgresVehicleMaintenanceDatasource } from "../../infrastructure/datasources/postgres-vehicle-maintenance.datasource";
import { VehicleMaintenanceRepositoryImpl } from "../../infrastructure/repositories/vehicle-maintenance.repository.impl";
import { MaintenanceProcedureController } from "./maintenance-procedure.controller";

import { prisma } from "../../data/postgresql";
import { CreateMaintenanceProcedure } from "../../domain";

// Crear instancias
const vehicleMaintenanceDatasource = new PostgresVehicleMaintenanceDatasource(
  prisma
);
const vehicleMaintenanceRepository = new VehicleMaintenanceRepositoryImpl(
  vehicleMaintenanceDatasource
);
const createMaintenanceProcedureUseCase = new CreateMaintenanceProcedure(
  vehicleMaintenanceRepository
);
const maintenanceProcedureController = new MaintenanceProcedureController(
  createMaintenanceProcedureUseCase,
  vehicleMaintenanceRepository,
  prisma
);

export class MaintenanceRoutes {
  static get routes(): Router {
    const router = Router();

    // Rutas de Procedimientos de Mantenimiento
    router.post("/procedures", maintenanceProcedureController.create);
    router.get("/procedures", maintenanceProcedureController.getAll);
    router.put("/procedures/:id", maintenanceProcedureController.update);
    router.delete("/procedures/:id", maintenanceProcedureController.delete);

    // Rutas de Mantenimientos
    router.post(
      "/maintenances",
      maintenanceProcedureController.createMaintenance
    );
    router.get("/maintenances", maintenanceProcedureController.getMaintenances);
    router.get(
      "/maintenances/:id",
      maintenanceProcedureController.getMaintenanceById
    );
    router.put(
      "/maintenances/:id/status",
      maintenanceProcedureController.updateMaintenanceStatus
    );

    // Rutas de Alertas
    router.post(
      "/alerts/generate",
      maintenanceProcedureController.generateAlerts
    );
    router.get("/alerts", maintenanceProcedureController.getAlerts);
    router.put(
      "/alerts/:id/read",
      maintenanceProcedureController.markAlertAsRead
    );
    router.delete("/alerts/:id", maintenanceProcedureController.dismissAlert);

    // Rutas de Reportes
    router.get(
      "/reports/incomplete",
      maintenanceProcedureController.getIncompleteMaintenances
    );
    router.get(
      "/reports/overdue",
      maintenanceProcedureController.getOverdueMaintenances
    );
    router.get(
      "/reports/upcoming/:days",
      maintenanceProcedureController.getUpcomingMaintenances
    );

    // Rutas de Jobs/Automatización
    router.post(
      "/jobs/schedule-maintenances",
      maintenanceProcedureController.runMaintenanceScheduler
    );
    router.post(
      "/jobs/generate-alerts",
      maintenanceProcedureController.runAlertsGenerator
    );
    router.delete(
      "/jobs/clean-alerts",
      maintenanceProcedureController.cleanOldAlerts
    );

    // Rutas de Configuración de Schedules
    router.post(
      "/setup/schedules",
      maintenanceProcedureController.setupMaintenanceSchedules
    );
    router.post(
      "/setup/schedules/:vehicleId",
      maintenanceProcedureController.setupCustomSchedule
    );
    router.get("/setup/stats", maintenanceProcedureController.getScheduleStats);

    return router;
  }
}
