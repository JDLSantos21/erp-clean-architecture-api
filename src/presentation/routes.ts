import { Router } from "express";
import { AuthRoutes } from "./auth/routes";
import { VehicleRoutes } from "./vehicles/routes";
import { EmployeeRoutes } from "./employee/routes";
import { FuelRoutes } from "./fuel/routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    router.use("/auth", AuthRoutes.routes);
    router.use("/vehicles", VehicleRoutes.routes);
    router.use("/employees", EmployeeRoutes.routes);
    router.use("/fuel", FuelRoutes.routes);

    return router;
  }
}
