import Router, { Router as RouterType } from "express";
import { AuthController } from "./controller";
import { AuthRepositoryImpl, AuthDataSourceImpl } from "../../infrastructure";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionMiddleware } from "../middlewares/permission.middleware";

export class AuthRoutes {
  static get routes(): RouterType {
    const router = Router();

    const authRepository = new AuthRepositoryImpl(new AuthDataSourceImpl());
    const controller = new AuthController(authRepository);

    const { isAdmin, elevateRole } = PermissionMiddleware;

    // Public routes
    router.post("/role", controller.createRole);
    router.post("/register", controller.registerUser);
    router.post("/login", controller.login);

    router.use(AuthMiddleware.validateJWT);

    router.get("/", controller.getUsers);
    router.get("/:id", controller.findById);

    return router;
  }
}
