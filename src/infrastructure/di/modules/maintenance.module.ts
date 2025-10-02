//Maintenance Module - Dependency Injection Registration
import { CreateMaintenanceProcedure } from "../../../domain";
import { MaintenanceProcedureController } from "../../../presentation";
import { PostgresVehicleMaintenanceDatasource } from "../../datasources";
import { VehicleMaintenanceRepositoryImpl } from "../../repositories";
import { IDIContainer } from "../types";

// Registro de todas las dependencias del módulo Maintenance
export function registerMaintenanceModule(container: IDIContainer): void {
  registerMaintenanceDatasources(container);
  registerMaintenanceRepositories(container);
  registerMaintenanceUseCases(container);
  registerMaintenanceControllers(container);
}

// Datasources
function registerMaintenanceDatasources(container: IDIContainer): void {
  container.register(
    "VehicleMaintenanceDatasource",
    () =>
      new PostgresVehicleMaintenanceDatasource(
        container.resolve("PrismaClient")
      )
  );
}

// Repositories
function registerMaintenanceRepositories(container: IDIContainer): void {
  container.register(
    "VehicleMaintenanceRepository",
    () =>
      new VehicleMaintenanceRepositoryImpl(
        container.resolve("VehicleMaintenanceDatasource")
      )
  );
}

// Use Cases
function registerMaintenanceUseCases(container: IDIContainer): void {
  // CreateMaintenanceProcedure
  container.register(
    "CreateMaintenanceProcedureUseCase",
    () =>
      new CreateMaintenanceProcedure(
        container.resolve("VehicleMaintenanceRepository")
      )
  );
}

/**
 * Controllers del módulo Maintenance
 *
 * NOTA: Este controller tiene un patrón diferente al resto,
 * recibe el use case directamente en vez de estar inyectado en el constructor.
 * Considerar refactorizar para que sea consistente con los demás controllers.
 */
function registerMaintenanceControllers(container: IDIContainer): void {
  container.register(
    "VehicleMaintenanceController",
    () =>
      new MaintenanceProcedureController(
        container.resolve("CreateMaintenanceProcedureUseCase"),
        container.resolve("VehicleMaintenanceRepository"),
        container.resolve("PrismaClient")
      )
  );
}
