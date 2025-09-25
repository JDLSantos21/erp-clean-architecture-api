import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { VehicleRoutes } from "./vehicles/routes";
import { EmployeeRoutes } from "./employee/routes";
import { FuelRoutes } from "./fuel/routes";
import { FuelAnalyticsRoutes } from "./fuel/analytics-routes";
import { InventoryRoutes } from "./inventory/routes";
import { MaintenanceRoutes } from "./maintenance/routes";
import { CustomerRoutes } from "./customers/customer.routes";
import { EquipmentReportRoutes } from "./equipment-reports/equipment-report.routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Sistema de autenticación y usuarios
    router.use("/auth", AuthRoutes.routes);

    // Sistemas de vehículos y empleados
    router.use("/vehicles", VehicleRoutes.routes);
    router.use("/employees", EmployeeRoutes.routes);

    // Sistema de combustible
    router.use("/fuel", FuelRoutes.routes);
    router.use("/fuel", FuelAnalyticsRoutes.routes);

    // Sistema de inventario
    router.use("/inventory", InventoryRoutes.routes);

    // Sistema de mantenimiento de vehículos
    router.use("/maintenance", MaintenanceRoutes.routes);

    // Sistema de gestión de clientes
    router.use("/customers", CustomerRoutes.routes);

    // Sistema de reportes de equipos
    router.use("/equipment-reports", EquipmentReportRoutes.routes);

    return router;
  }
}
