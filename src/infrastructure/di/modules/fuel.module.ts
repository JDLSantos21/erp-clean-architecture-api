//Fuel Module - Dependency Injection Registration
import {
  CreateFuelConsumption,
  UpdateFuelConsumption,
  DeleteFuelConsumption,
  CreateFuelTankRefill,
  GetDashboardMetrics,
  GetDashboardSummary,
  GetVehicleMetrics,
} from "../../../domain";
import { FuelController, FuelAnalyticsController } from "../../../presentation";
import {
  FuelDatasourceImpl,
  FuelAnalyticsDatasourceImpl,
} from "../../datasources";
import {
  FuelRepositoryImpl,
  FuelAnalyticsRepositoryImpl,
} from "../../repositories";
import { IDIContainer } from "../types";

//Registro de todas las dependencias del módulo Fuel
export function registerFuelModule(container: IDIContainer): void {
  registerFuelDatasources(container);
  registerFuelRepositories(container);
  registerFuelUseCases(container);
  registerFuelControllers(container);
}

// Datasources
function registerFuelDatasources(container: IDIContainer): void {
  // Fuel Datasource
  container.register(
    "FuelDatasource",
    () => new FuelDatasourceImpl(container.resolve("PrismaClient"))
  );

  // Fuel Analytics Datasource
  container.register(
    "FuelAnalyticsDatasource",
    () => new FuelAnalyticsDatasourceImpl(container.resolve("PrismaClient"))
  );
}

//Fuel Repositories
function registerFuelRepositories(container: IDIContainer): void {
  // Fuel Repository
  container.register(
    "FuelRepository",
    () => new FuelRepositoryImpl(container.resolve("FuelDatasource"))
  );

  // Fuel Analytics Repository
  container.register(
    "FuelAnalyticsRepository",
    () =>
      new FuelAnalyticsRepositoryImpl(
        container.resolve("FuelAnalyticsDatasource")
      )
  );
}

// Use Cases
function registerFuelUseCases(container: IDIContainer): void {
  container.register(
    "CreateFuelConsumptionUseCase",
    () =>
      new CreateFuelConsumption(
        container.resolve("FuelRepository"),
        container.resolve("VehicleRepository"),
        container.resolve("EmployeeRepository")
      )
  );
  container.register(
    "UpdateFuelConsumptionUseCase",
    () => new UpdateFuelConsumption(container.resolve("FuelRepository"))
  );
  container.register(
    "DeleteFuelConsumptionUseCase",
    () => new DeleteFuelConsumption(container.resolve("FuelRepository"))
  );
  container.register(
    "CreateFuelTankRefillUseCase",
    () => new CreateFuelTankRefill(container.resolve("FuelRepository"))
  );

  // Analytics Use Cases
  container.register(
    "GetDashboardSummaryUseCase",
    () => new GetDashboardSummary(container.resolve("FuelAnalyticsRepository"))
  );
  container.register(
    "GetDashboardMetricsUseCase",
    () => new GetDashboardMetrics(container.resolve("FuelAnalyticsRepository"))
  );
  container.register(
    "GetVehicleMetricsUseCase",
    () => new GetVehicleMetrics(container.resolve("FuelAnalyticsRepository"))
  );
}

// Controllers del módulo Fuel
function registerFuelControllers(container: IDIContainer): void {
  // Fuel Controller
  container.register(
    "FuelController",
    () =>
      new FuelController(
        container.resolve("CreateFuelConsumptionUseCase"),
        container.resolve("UpdateFuelConsumptionUseCase"),
        container.resolve("DeleteFuelConsumptionUseCase"),
        container.resolve("CreateFuelTankRefillUseCase"),
        container.resolve("FuelRepository"),
        container.resolve("VehicleRepository"),
        container.resolve("EmployeeRepository")
      )
  );

  // Fuel Analytics Controller
  container.register(
    "FuelAnalyticsController",
    () =>
      new FuelAnalyticsController(
        container.resolve("GetDashboardSummaryUseCase"),
        container.resolve("GetDashboardMetricsUseCase"),
        container.resolve("GetVehicleMetricsUseCase"),
        container.resolve("FuelAnalyticsRepository")
      )
  );
}
