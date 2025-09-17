import Router, { Router as RouterType } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { FuelController } from "./controller";
import {
  FuelDatasourceImpl,
  FuelRepositoryImpl,
  VehicleDatasourceImpl,
  VehicleRepositoryImpl,
  EmployeeDatasourceImpl,
  EmployeeRepositoryImpl,
} from "../../infrastructure";

export class FuelRoutes {
  static get routes(): RouterType {
    const router = Router();

    const fuelRepository = new FuelRepositoryImpl(new FuelDatasourceImpl());
    const vehicleRepository = new VehicleRepositoryImpl(
      new VehicleDatasourceImpl()
    );
    const employeeRepository = new EmployeeRepositoryImpl(
      new EmployeeDatasourceImpl()
    );
    const controller = new FuelController(
      fuelRepository,
      vehicleRepository,
      employeeRepository
    );

    const { elevateRole } = PermissionMiddleware;

    router.use(AuthMiddleware.validateJWT);

    router.use(PermissionMiddleware.elevateRole);

    router.post("/consumption", controller.createFuelConsumption);
    router.get("/consumption", controller.findAllFuelConsumptions);
    router.delete("/consumption/:id", controller.deleteFuelConsumption);
    router.patch("/consumption/:id", controller.updateFuelConsumption);
    router.post("/tank", controller.createFuelTank);
    router.get("/tank", controller.getTankCurrentStatus);
    router.post("/tank-refill", controller.createFuelTankRefill);
    router.get("/tank-refill", controller.findAllTankRefills);
    router.get("/tank-refill/:id", controller.findTankRefillById);
    router.post("/tank/reset", controller.resetFuelTankLevel);

    return router;
  }
}
