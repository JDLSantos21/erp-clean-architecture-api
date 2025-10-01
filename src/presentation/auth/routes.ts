import Router, { Router as RouterType } from "express";
import { AuthController } from "./controller";
import { DIContainer } from "../../infrastructure";
import { AuthMiddleware, PermissionMiddleware } from "../middlewares";

export class AuthRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller = container.resolve<AuthController>("AuthController");

    const { isAdmin, elevateRole } = PermissionMiddleware;

    // Public routes
    router.post("/role", controller.createRole);
    router.post("/register", controller.registerUser);
    router.post("/login", controller.login);

    router.use(AuthMiddleware.validateJWT);

    router.get("/", controller.getUsers);
    router.get("/:id", controller.findById);
    router.post("/set-roles/:id", elevateRole, controller.setRolesToUser);

    return router;
  }
}
