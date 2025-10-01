import Router, { Router as RouterType } from "express";
import { InventoryController } from "./controller";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";
import { DIContainer } from "../../infrastructure";

export class InventoryRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<InventoryController>(
      "InventoryController"
    );
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);

    const { supervision, advancedOperations, readOnly, administration } =
      PermissionMiddleware;

    router.post("/material", supervision, controller.createMaterial);
    router.get("/material", readOnly, controller.getMaterials);
    router.post(
      "/material/category",
      supervision,
      controller.createMaterialCategory
    );
    router.delete("/material/:id", administration, controller.deleteMaterial);
    router.get("/material/category", readOnly, controller.getCategories);
    router.delete(
      "/material/category/:id",
      administration,
      controller.deleteCategory
    );
    router.post("/material/unit", supervision, controller.createMaterialUnit);
    router.delete("/material/unit/:id", administration, controller.deleteUnit);
    router.get("/material/unit", readOnly, controller.getUnits);
    router.get("/material/:id", readOnly, controller.getMaterialById);
    router.put("/material/:id", supervision, controller.updateMaterial);
    router.post("/movement", advancedOperations, controller.createMovement);
    router.get("/movement", readOnly, controller.getStockMoves);
    router.get("/movement/:id", readOnly, controller.getStockMoveById);

    return router;
  }
}
