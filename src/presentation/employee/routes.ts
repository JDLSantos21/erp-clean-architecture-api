import Router, { Router as RouterType } from "express";
import { EmployeeController } from "./controller";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";

import { DIContainer } from "../../infrastructure";

export class EmployeeRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller =
      container.resolve<EmployeeController>("EmployeeController");
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);
    router.use(PermissionMiddleware.elevateRole);

    router.post("/", controller.createEmployee);
    router.put("/:id", controller.updateEmployee);
    router.get("/", controller.findAll);
    router.get("/:id", controller.findById);
    router.delete("/:id", controller.deleteEmployee);

    return router;
  }
}
