// Order Module - Dependency Injection Registration
import {
  CreateOrder,
  TrackingCodeGenerator,
  UpdateOrder,
} from "../../../domain";
import { OrderController } from "../../../presentation";
import { OrderDatasourceImpl } from "../../datasources";
import { OrderRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

export function registerOrderModule(container: IDIContainer): void {
  registerOrderServices(container);
  registerOrderDatasources(container);
  registerOrderRepositories(container);
  registerOrderUseCases(container);
  registerOrderControllers(container);
}

//Services
function registerOrderServices(container: IDIContainer): void {
  container.register(
    "TrackingCodeGenerator",
    () => new TrackingCodeGenerator()
  );
}

// Datasources
function registerOrderDatasources(container: IDIContainer): void {
  container.register(
    "OrderDatasource",
    () => new OrderDatasourceImpl(container.resolve("PrismaClient"))
  );
}

// Repositories
function registerOrderRepositories(container: IDIContainer): void {
  container.register(
    "OrderRepository",
    () => new OrderRepositoryImpl(container.resolve("OrderDatasource"))
  );
}

//Use Cases
function registerOrderUseCases(container: IDIContainer): void {
  container.register(
    "CreateOrderUseCase",
    () =>
      new CreateOrder(
        container.resolve("OrderRepository"),
        container.resolve("CustomerRepository"),
        container.resolve("TrackingCodeGenerator")
      )
  );

  container.register(
    "UpdateOrderUseCase",
    () => new UpdateOrder(container.resolve("OrderRepository"))
  );

  // TODO: Registrar otros use cases cuando se implementen
  // container.register("UpdateOrderUseCase", () => new UpdateOrder(...));
  // container.register("DeleteOrderUseCase", () => new DeleteOrder(...));
}

/**
 * Controllers
 */
function registerOrderControllers(container: IDIContainer): void {
  container.register(
    "OrderController",
    () =>
      new OrderController(
        container.resolve("CreateOrderUseCase"),
        container.resolve("UpdateOrderUseCase"),
        container.resolve("OrderRepository")
      )
  );
}
