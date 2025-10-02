/**
 * Tipos compartidos para el sistema de Dependency Injection
 */

export interface IDIContainer {
  register<T>(key: string, factory: () => T): void;
  registerSingleton<T>(key: string, factory: () => T): void;
  resolve<T>(key: string): T;
}

/**
 * Función de registro de módulo
 * Cada módulo exporta una función con esta firma
 */
export type ModuleRegistration = (container: IDIContainer) => void;
