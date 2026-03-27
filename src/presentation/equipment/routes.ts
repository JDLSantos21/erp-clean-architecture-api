import { Router } from "express";
import { DIContainer } from "../../infrastructure";
import { EquipmentController } from "./controller";
import { AuthMiddleware } from "../middlewares";

export class EquipmentRoutes {
  static get routes(): Router {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<EquipmentController>(
      "EquipmentController",
    );
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);

    router.post("/", controller.create);
    router.get("/", controller.getAll);
    router.delete("/:id", controller.delete);
    router.get("/customer/:customerId", controller.getAllByCustomerId);
    router.post("/assign", controller.assignEquipment);
    router.post("/unassign", controller.unassignEquipment);

    router.post("/models", controller.createModel);
    router.patch("/models/:id", controller.updateModel);
    router.get("/models", controller.getAllModels);
    router.get("/models/:id", controller.getModelById);

    router.get("/:id", controller.getEquipmentById);
    return router;
  }
}
