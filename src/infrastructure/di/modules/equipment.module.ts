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
  // registerEquipmentDatasources(container);
  // registerEquipmentRepositories(container);
  // registerEquipmentUseCases(container);
}

/**
 * Equipment Services
 */
function registerEquipmentServices(container: IDIContainer): void {
  container.register(
    "EquipmentSerialGenerator",
    () => new EquipmentSerialGenerator(container.resolve("PrismaClient"))
  );
}
