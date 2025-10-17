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

    router.post("/", controller.create);
    router.get("/:id", controller.getEquipmentById);
    router.get("/", controller.getAll);
    router.post("/assign", controller.assignEquipment);
    router.post("/unassign", controller.unassignEquipment);

    router.post("/model", controller.createModel);
    router.patch("/model/:id", controller.updateModel);
    router.get("/model", controller.getAllModels);
    router.get("/model/:id", controller.getModelById);

    return router;
  }
}
