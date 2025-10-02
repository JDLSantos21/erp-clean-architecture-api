// Vehicle Module - Dependency Injection Registration

import { CreateVehicle, UpdateVehicle } from "../../../domain";
import { VehicleController } from "../../../presentation";
import { VehicleDatasourceImpl } from "../../datasources";
import { VehicleRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

// Registro de todas las dependencias del módulo Vehicle
export function registerVehicleModule(container: IDIContainer): void {
  registerVehicleDatasources(container);
  registerVehicleRepositories(container);
  registerVehicleUseCases(container);
  registerVehicleControllers(container);
}

// Datasources
function registerVehicleDatasources(container: IDIContainer): void {
  container.register(
    "VehicleDatasource",
    () => new VehicleDatasourceImpl(container.resolve("PrismaClient"))
  );
}

// Repositories
function registerVehicleRepositories(container: IDIContainer): void {
  container.register(
    "VehicleRepository",
    () => new VehicleRepositoryImpl(container.resolve("VehicleDatasource"))
  );
}

// Use Cases
function registerVehicleUseCases(container: IDIContainer): void {
  // CreateVehicle
  container.register(
    "CreateVehicleUseCase",
    () => new CreateVehicle(container.resolve("VehicleRepository"))
  );

  // UpdateVehicle
  container.register(
    "UpdateVehicleUseCase",
    () => new UpdateVehicle(container.resolve("VehicleRepository"))
  );
}

// Controllers
function registerVehicleControllers(container: IDIContainer): void {
  container.register(
    "VehicleController",
    () =>
      new VehicleController(
        container.resolve("CreateVehicleUseCase"),
        container.resolve("UpdateVehicleUseCase"),
        container.resolve("VehicleRepository")
      )
  );
}
