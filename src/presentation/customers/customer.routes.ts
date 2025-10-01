import Router, { Router as RouterType } from "express";
import { PermissionMiddleware, AuthMiddleware } from "../middlewares";
import { CustomerController } from "./customer.controller";
import { DIContainer } from "../../infrastructure";

export class CustomerRoutes {
  static get routes(): RouterType {
    const router = Router();

    const container = DIContainer.getInstance();
    const controller =
      container.resolve<CustomerController>("CustomerController");
    const authMiddleware = container.resolve<AuthMiddleware>("AuthMiddleware");

    router.use(authMiddleware.validateJWT);
    const { advancedOperations, readOnly } = PermissionMiddleware;

    // Rutas sin parámetros primero
    router.post("/", advancedOperations, controller.createCustomer);
    router.get("/", readOnly, controller.getAllCustomers);

    // Rutas con parámetros específicos (más específicas primero)
    router.patch("/:id", advancedOperations, controller.updateCustomer);
    router.delete("/:id", advancedOperations, controller.deleteCustomer);

    // Direcciones
    router.post(
      "/:id/addresses",
      advancedOperations,
      controller.createCustomerAddress
    );
    router.get("/:id/addresses", readOnly, controller.getCustomerAddresses);
    router.patch(
      "/addresses/:addressId",
      advancedOperations,
      controller.updateCustomerAddress
    );

    // Telefonos
    router.post(
      "/:id/phones",
      advancedOperations,
      controller.createCustomerPhone
    );
    router.get("/:id/phones", readOnly, controller.getCustomerPhones);
    router.patch(
      "/phones/:phoneId",
      advancedOperations,
      controller.updateCustomerPhone
    );

    // Ruta general con parámetro al final
    router.get("/:id", readOnly, controller.getCustomerById);

    return router;
  }
}
