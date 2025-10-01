import { BcryptAdapter } from "../../config";
import { prisma } from "../../data/postgresql";
import { CreateMaintenanceProcedure } from "../../domain";
import {
  VehicleController,
  AuthController,
  CustomerController,
  EmployeeController,
  FuelController,
  FuelAnalyticsController,
  InventoryController,
  MaintenanceProcedureController,
  AuthMiddleware,
} from "../../presentation";
import {
  AuthDataSourceImpl,
  CustomerDatasourceImpl,
  EmployeeDatasourceImpl,
  FuelAnalyticsDatasourceImpl,
  FuelDatasourceImpl,
  InventoryDatasourceImpl,
  VehicleDatasourceImpl,
  PostgresVehicleMaintenanceDatasource,
} from "../datasources";
import { WinstonLogger } from "../logger";
import {
  AuthRepositoryImpl,
  CustomerRepositoryImpl,
  EmployeeRepositoryImpl,
  FuelAnalyticsRepositoryImpl,
  FuelRepositoryImpl,
  InventoryRepositoryImpl,
  VehicleMaintenanceRepositoryImpl,
  VehicleRepositoryImpl,
} from "../repositories";

export class DIContainer {
  private static instance: DIContainer;
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  private constructor() {
    this.registerDefaults();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, () => {
      if (!this.services.has(key)) {
        this.services.set(key, factory());
      }
      return this.services.get(key);
    });
  }

  resolve<T>(key: string): T {
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not found in DI Container`);
    }
    return factory();
  }

  private registerDefaults() {
    // Infrastructure Services
    this.registerSingleton("Logger", () => {
      const logger = new WinstonLogger();
      logger.initialize();
      return logger;
    });

    // Database
    this.registerSingleton("PrismaClient", () => prisma);
    // Hashing
    this.registerSingleton("HashFunction", () => BcryptAdapter.hash);
    this.registerSingleton("CompareFunction", () => BcryptAdapter.compare);

    // Datasources
    this.register(
      "AuthDatasource",
      () =>
        new AuthDataSourceImpl(
          this.resolve("PrismaClient"),
          this.resolve("HashFunction"),
          this.resolve("CompareFunction")
        )
    );
    this.register(
      "VehicleDatasource",
      () => new VehicleDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "FuelDatasource",
      () => new FuelDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "CustomerDatasource",
      () => new CustomerDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "InventoryDatasource",
      () => new InventoryDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "EmployeeDatasource",
      () => new EmployeeDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "FuelAnalyticsDatasource",
      () => new FuelAnalyticsDatasourceImpl(this.resolve("PrismaClient"))
    );
    this.register(
      "VehicleMaintenanceDatasource",
      () =>
        new PostgresVehicleMaintenanceDatasource(this.resolve("PrismaClient"))
    );

    // Repositories
    this.register(
      "AuthRepository",
      () => new AuthRepositoryImpl(this.resolve("AuthDatasource"))
    );
    this.register(
      "VehicleRepository",
      () => new VehicleRepositoryImpl(this.resolve("VehicleDatasource"))
    );
    this.register(
      "FuelRepository",
      () => new FuelRepositoryImpl(this.resolve("FuelDatasource"))
    );
    this.register(
      "CustomerRepository",
      () => new CustomerRepositoryImpl(this.resolve("CustomerDatasource"))
    );
    this.register(
      "InventoryRepository",
      () => new InventoryRepositoryImpl(this.resolve("InventoryDatasource"))
    );
    this.register(
      "EmployeeRepository",
      () => new EmployeeRepositoryImpl(this.resolve("EmployeeDatasource"))
    );
    this.register(
      "FuelAnalyticsRepository",
      () =>
        new FuelAnalyticsRepositoryImpl(this.resolve("FuelAnalyticsDatasource"))
    );
    this.register(
      "VehicleMaintenanceRepository",
      () =>
        new VehicleMaintenanceRepositoryImpl(
          this.resolve("VehicleMaintenanceDatasource")
        )
    );
    // Controllers
    this.register(
      "AuthController",
      () => new AuthController(this.resolve("AuthRepository"))
    );
    this.register(
      "AuthMiddleware",
      () => new AuthMiddleware(this.resolve("AuthRepository"))
    );
    this.register(
      "VehicleController",
      () => new VehicleController(this.resolve("VehicleRepository"))
    );
    this.register(
      "CustomerController",
      () => new CustomerController(this.resolve("CustomerRepository"))
    );
    this.register(
      "EmployeeController",
      () => new EmployeeController(this.resolve("EmployeeRepository"))
    );
    this.register(
      "FuelController",
      () =>
        new FuelController(
          this.resolve("FuelRepository"),
          this.resolve("VehicleRepository"),
          this.resolve("EmployeeRepository")
        )
    );
    this.register(
      "FuelAnalyticsController",
      () => new FuelAnalyticsController(this.resolve("FuelAnalyticsRepository"))
    );
    this.register(
      "InventoryController",
      () => new InventoryController(this.resolve("InventoryRepository"))
    );
    this.register(
      "VehicleMaintenanceController",
      () =>
        new MaintenanceProcedureController(
          new CreateMaintenanceProcedure(
            this.resolve("VehicleMaintenanceRepository")
          ),
          this.resolve("VehicleMaintenanceRepository"),
          this.resolve("PrismaClient")
        )
    );
  }
}
