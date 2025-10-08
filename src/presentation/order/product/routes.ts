import Router, { Router as RouterType } from "express";
import { DIContainer } from "../../../infrastructure";
import { ProductController } from "./controller";
import { AuthMiddleware } from "../../middlewares";

export class ProductRoutes {
  static get routes(): RouterType {
    const router = Router();
    const container = DIContainer.getInstance();
    const controller =
      container.resolve<ProductController>("ProductController");
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);

    router.post("/", controller.createProduct);
    router.get("/", controller.getAllProducts);
    router.get("/:id", controller.getProductById);
    router.put("/:id", controller.updateProduct);
    router.delete("/:id", controller.deleteProduct);

    return router;
  }
}
