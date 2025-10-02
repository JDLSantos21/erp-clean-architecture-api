//Inventory Module - Dependency Injection Registration
import {
  CreateMaterial,
  CreateStockMove,
  DeleteCategory,
  DeleteMaterial,
  DeleteUnit,
  UpdateMaterial,
} from "../../../domain";
import { InventoryController } from "../../../presentation";
import { InventoryDatasourceImpl } from "../../datasources";
import { InventoryRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

// Registro de todas las dependencias del módulo Inventory
export function registerInventoryModule(container: IDIContainer): void {
  registerInventoryDatasources(container);
  registerInventoryRepositories(container);
  registerInventoryUseCases(container);
  registerInventoryControllers(container);
}

// Datasources
function registerInventoryDatasources(container: IDIContainer): void {
  container.register(
    "InventoryDatasource",
    () => new InventoryDatasourceImpl(container.resolve("PrismaClient"))
  );
}

// Repositories
function registerInventoryRepositories(container: IDIContainer): void {
  container.register(
    "InventoryRepository",
    () => new InventoryRepositoryImpl(container.resolve("InventoryDatasource"))
  );
}

// Use Cases
function registerInventoryUseCases(container: IDIContainer): void {
  container.register(
    "CreateMaterialUseCase",
    () => new CreateMaterial(container.resolve("InventoryRepository"))
  );
  container.register(
    "UpdateMaterialUseCase",
    () => new UpdateMaterial(container.resolve("InventoryRepository"))
  );
  container.register(
    "DeleteMaterialUseCase",
    () => new DeleteMaterial(container.resolve("InventoryRepository"))
  );
  container.register(
    "CreateStockMoveUseCase",
    () => new CreateStockMove(container.resolve("InventoryRepository"))
  );
  container.register(
    "DeleteUnitUseCase",
    () => new DeleteUnit(container.resolve("InventoryRepository"))
  );
  container.register(
    "DeleteCategoryUseCase",
    () => new DeleteCategory(container.resolve("InventoryRepository"))
  );
}

// Controllers
function registerInventoryControllers(container: IDIContainer): void {
  container.register(
    "InventoryController",
    () =>
      new InventoryController(
        container.resolve("CreateMaterialUseCase"),
        container.resolve("UpdateMaterialUseCase"),
        container.resolve("DeleteMaterialUseCase"),
        container.resolve("CreateStockMoveUseCase"),
        container.resolve("DeleteUnitUseCase"),
        container.resolve("DeleteCategoryUseCase"),
        container.resolve("InventoryRepository")
      )
  );
}
