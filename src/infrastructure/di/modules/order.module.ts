// Order Module - Dependency Injection Registration
import {
  AssignOrderToEmployee,
  ClearOrderAssignation,
  CreateOrder,
  CreateProduct,
  DeleteProduct,
  TrackingCodeGenerator,
  UpdateOrder,
  UpdateOrderStatus,
  UpdateProduct,
} from "../../../domain";
import { OrderController, ProductController } from "../../../presentation";
import { OrderDatasourceImpl, ProductDatasourceImpl } from "../../datasources";
import { OrderRepositoryImpl, ProductRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

export function registerOrderModule(container: IDIContainer): void {
  registerOrderServices(container);
  registerOrderDatasources(container);
  registerOrderRepositories(container);
  registerOrderUseCases(container);
  registerOrderControllers(container);
  registerProductControllers(container);
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
    () =>
      new OrderDatasourceImpl(
        container.resolve("PrismaClient"),
        container.resolve("CacheService")
      )
  );

  container.register(
    "ProductDatasource",
    () =>
      new ProductDatasourceImpl(
        container.resolve("PrismaClient"),
        container.resolve("CacheService")
      )
  );
}

// Repositories
function registerOrderRepositories(container: IDIContainer): void {
  container.register(
    "OrderRepository",
    () => new OrderRepositoryImpl(container.resolve("OrderDatasource"))
  );
  container.register(
    "ProductRepository",
    () => new ProductRepositoryImpl(container.resolve("ProductDatasource"))
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

  container.register(
    "AssignOrderToEmployeeUseCase",
    () =>
      new AssignOrderToEmployee(
        container.resolve("OrderRepository"),
        container.resolve("AuthRepository")
      )
  );

  container.register(
    "UpdateOrderStatusUseCase",
    () => new UpdateOrderStatus(container.resolve("OrderRepository"))
  );

  container.register(
    "ClearOrderAssignationUseCase",
    () => new ClearOrderAssignation(container.resolve("OrderRepository"))
  );

  // Product Use Cases

  container.register(
    "CreateProductUseCase",
    () => new CreateProduct(container.resolve("ProductRepository"))
  );

  container.register(
    "UpdateProductUseCase",
    () => new UpdateProduct(container.resolve("ProductRepository"))
  );

  container.register(
    "DeleteProductUseCase",
    () => new DeleteProduct(container.resolve("ProductRepository"))
  );
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
        container.resolve("UpdateOrderStatusUseCase"),
        container.resolve("ClearOrderAssignationUseCase"),
        container.resolve("AssignOrderToEmployeeUseCase"),
        container.resolve("OrderRepository")
      )
  );
}

function registerProductControllers(container: IDIContainer): void {
  container.register(
    "ProductController",
    () =>
      new ProductController(
        container.resolve("CreateProductUseCase"),
        container.resolve("UpdateProductUseCase"),
        container.resolve("DeleteProductUseCase"),
        container.resolve("ProductRepository")
      )
  );
}
