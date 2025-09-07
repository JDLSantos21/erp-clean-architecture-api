import Router, { Router as RouterType } from "express";
import { EmployeeController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { EmployeeDatasourceImpl } from "../../infrastructure/datasources/employee.datasource.impl";
import { EmployeeRepositoryImpl } from "../../infrastructure/repositories/employee.repository.impl";

export class EmployeeRoutes {
  static get routes(): RouterType {
    const router = Router();

    const employeeRepository = new EmployeeRepositoryImpl(
      new EmployeeDatasourceImpl()
    );
    const controller = new EmployeeController(employeeRepository);

    const { elevateRole } = PermissionMiddleware;

    router.use(AuthMiddleware.validateJWT);
    router.use(PermissionMiddleware.elevateRole);

    router.post("/", controller.createEmployee);
    router.put("/:id", controller.updateEmployee);
    router.get("/", controller.findAll);
    router.get("/:id", controller.findById);
    router.delete("/:id", controller.deleteEmployee);

    // Public routes

    return router;
  }
}
