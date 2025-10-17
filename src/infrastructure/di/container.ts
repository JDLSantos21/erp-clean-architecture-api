// Dependency Injection Container
// Patrón: Service Locator + Dependency Injection
import { BcryptAdapter } from "../../config";
import { prisma } from "../../data/postgresql";
import { WinstonLogger } from "../logger";
import { IDIContainer } from "./types";
import {
  registerAuthModule,
  registerVehicleModule,
  registerFuelModule,
  registerCustomerModule,
  registerEmployeeModule,
  registerInventoryModule,
  registerMaintenanceModule,
  registerOrderModule,
  registerCacheModule,
  registerEquipmentModule,
} from "./modules";

export class DIContainer implements IDIContainer {
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

  // Registro de todas las dependencias
  private registerDefaults(): void {
    this.registerCoreServices();

    // Domain Modules
    registerCacheModule(this);
    registerAuthModule(this);
    registerVehicleModule(this);
    registerFuelModule(this);
    registerCustomerModule(this);
    registerEmployeeModule(this);
    registerInventoryModule(this);
    registerMaintenanceModule(this);
    registerOrderModule(this);
    registerEquipmentModule(this);
  }

  // Registro de servicios core de infraestructura
  private registerCoreServices(): void {
    // Logger
    this.registerSingleton("Logger", () => {
      const logger = new WinstonLogger();
      logger.initialize();
      return logger;
    });

    // Database
    this.registerSingleton("PrismaClient", () => prisma);

    // Hashing Functions
    this.registerSingleton("HashFunction", () => BcryptAdapter.hash);
    this.registerSingleton("CompareFunction", () => BcryptAdapter.compare);
  }
}
