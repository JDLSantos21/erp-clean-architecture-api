import { EquipmentDatasourceImpl, EquipmentRepositoryImpl } from "../..";
import {
  AssignEquipment,
  CreateEquipment,
  UnassignEquipment,
} from "../../../domain";
import { EquipmentController } from "../../../presentation";
import { EquipmentSerialGenerator } from "../../services";
import { IDIContainer } from "../types";

/**
 * Equipment Module Registration
 *
 * Registra todas las dependencias del módulo Equipment:
 * - Services (EquipmentSerialGenerator)
 * - Datasources
 * - Repositories
 * - Use Cases
 */
export function registerEquipmentModule(container: IDIContainer): void {
  registerEquipmentServices(container);
  registerEquipmentDatasources(container);
  registerEquipmentRepositories(container);
  registerEquipmentUseCases(container);
  registerEquipmentControllers(container);
}

// Datasources
function registerEquipmentDatasources(container: IDIContainer): void {
  container.register(
    "EquipmentDatasource",
    () =>
      new EquipmentDatasourceImpl(
        container.resolve("PrismaClient"),
        container.resolve("CacheService")
      )
  );
}

// Repositories
function registerEquipmentRepositories(container: IDIContainer): void {
  container.register(
    "EquipmentRepository",
    () => new EquipmentRepositoryImpl(container.resolve("EquipmentDatasource"))
  );
}

//Controllers
function registerEquipmentControllers(container: IDIContainer): void {
  container.register(
    "EquipmentController",
    () =>
      new EquipmentController(
        container.resolve("CreateEquipmentUseCase"),
        container.resolve("AssignEquipmentUseCase"),
        container.resolve("UnassignEquipmentUseCase"),
        container.resolve("EquipmentRepository")
      )
  );
}

//use cases
function registerEquipmentUseCases(container: IDIContainer): void {
  container.register(
    "CreateEquipmentUseCase",
    () =>
      new CreateEquipment(
        container.resolve("EquipmentRepository"),
        container.resolve("EquipmentSerialGenerator")
      )
  );
  container.register(
    "AssignEquipmentUseCase",
    () => new AssignEquipment(container.resolve("EquipmentRepository"))
  );

  container.register(
    "UnassignEquipmentUseCase",
    () => new UnassignEquipment(container.resolve("EquipmentRepository"))
  );
}

// Services
function registerEquipmentServices(container: IDIContainer): void {
  container.register(
    "EquipmentSerialGenerator",
    () => new EquipmentSerialGenerator(container.resolve("PrismaClient"))
  );
}
