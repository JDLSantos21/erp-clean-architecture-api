import { Router } from "express";
import { DIContainer } from "../../infrastructure";
import { EquipmentController } from "./controller";
import { AuthMiddleware } from "../middlewares";

export class EquipmentRoutes {
  static get routes(): Router {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<EquipmentController>(
      "EquipmentController"
    );
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);

    router.get("/models", controller.getAllModels);
    router.get("/models/:id", controller.getModelById);
    router.post("/", controller.create);
    router.get("/:id", controller.getEquipmentById);
    router.get("/", controller.getAll);
    router.get("/customer/:customerId", controller.getAllByCustomerId);
    router.post("/assign", controller.assignEquipment);
    router.post("/unassign", controller.unassignEquipment);
    router.post("/models", controller.createModel);
    router.patch("/models/:id", controller.updateModel);

    return router;
  }
}
