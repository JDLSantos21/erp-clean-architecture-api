import { Router } from "express";
import { EquipmentReportController } from "./equipment-report.controller";

export class EquipmentReportRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new EquipmentReportController();

    // Rutas principales de reportes
    router.post("/", controller.createReport);
    router.get("/", controller.getAllReports);
    router.get("/critical", controller.getCriticalReports);
    router.get("/summary", controller.getReportsSummary);
    router.get("/:id", controller.getReportById);

    // Rutas de gestión de estado de reportes
    router.put("/:id/start", controller.startWork);
    router.put("/:id/complete", controller.completeWork);

    return router;
  }
}
