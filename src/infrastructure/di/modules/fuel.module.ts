//Fuel Module - Dependency Injection Registration
import {
  CreateFuelConsumption,
  UpdateFuelConsumption,
  DeleteFuelConsumption,
  CreateFuelTankRefill,
  GetDashboardMetrics,
  GetDashboardSummary,
  GetVehicleMetrics,
  GetFuelDashboard,
} from "../../../domain";
import { FuelController, FuelAnalyticsController } from "../../../presentation";
import {
  FuelDatasourceImpl,
  FuelAnalyticsDatasourceImpl,
} from "../../datasources";
import { FuelDashboardDatasourceImpl } from "../../datasources/fuel-dashboard.datasource.impl";
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
  container.register(
    "FuelDatasource",
    () => new FuelDatasourceImpl(container.resolve("PrismaClient"))
  );

  container.register(
    "FuelAnalyticsDatasource",
    () => new FuelAnalyticsDatasourceImpl(container.resolve("PrismaClient"))
  );

  container.register(
    "FuelDashboardDatasource",
    () => new FuelDashboardDatasourceImpl(container.resolve("PrismaClient"))
  );
}

//Fuel Repositories
function registerFuelRepositories(container: IDIContainer): void {
  container.register(
    "FuelRepository",
    () => new FuelRepositoryImpl(container.resolve("FuelDatasource"))
  );

  container.register(
    "FuelAnalyticsRepository",
    () =>
      new FuelAnalyticsRepositoryImpl(
        container.resolve("FuelAnalyticsDatasource"),
        container.resolve("FuelDashboardDatasource")
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
  container.register(
    "GetFuelDashboardUseCase",
    () => new GetFuelDashboard(container.resolve("FuelAnalyticsRepository"))
  );
}

// Controllers del módulo Fuel
function registerFuelControllers(container: IDIContainer): void {
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

  container.register(
    "FuelAnalyticsController",
    () =>
      new FuelAnalyticsController(
        container.resolve("GetDashboardSummaryUseCase"),
        container.resolve("GetDashboardMetricsUseCase"),
        container.resolve("GetVehicleMetricsUseCase"),
        container.resolve("GetFuelDashboardUseCase"),
        container.resolve("FuelAnalyticsRepository")
      )
  );
}

