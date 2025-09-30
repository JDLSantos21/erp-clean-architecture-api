import Router, { Router as RouterType } from "express";
import { PermissionMiddleware } from "../middlewares/permission.middleware";
import { CustomerController } from "./customer.controller";
import { CustomerRepositoryImpl } from "../../infrastructure/repositories/customer.repository.impl";
import { CustomerDatasourceImpl } from "../../infrastructure/datasources/customer.datasource.impl";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class CustomerRoutes {
  static get routes(): RouterType {
    const router = Router();

    const customerRepository = new CustomerRepositoryImpl(
      new CustomerDatasourceImpl()
    );
    const controller = new CustomerController(customerRepository);
    router.use(AuthMiddleware.validateJWT);
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
