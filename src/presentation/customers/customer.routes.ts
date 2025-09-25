import { Router } from "express";
import { CustomerController } from "./customer.controller";

export class CustomerRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new CustomerController();

    // Rutas principales de clientes
    router.post("/", controller.createCustomer);
    router.get("/", controller.getAllCustomers);
    router.get("/summary", controller.getCustomersSummary);
    router.get("/:id", controller.getCustomerById);

    // Rutas de gestión de teléfonos
    router.post("/:id/phones", controller.addCustomerPhone);

    // Rutas de gestión de direcciones
    router.post("/:id/addresses", controller.addCustomerAddress);

    // Rutas de gestión de equipos
    router.post("/:id/assign-equipment", controller.assignEquipment);
    router.get("/:id/equipment", controller.getCustomerEquipment);
    router.put(
      "/:customerId/equipment/:assignmentId/return",
      controller.returnEquipment
    );

    return router;
  }
}
