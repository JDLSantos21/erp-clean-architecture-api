/**
 * Cache Service (Domain Layer - Interface)
 *
 * Define el contrato que debe cumplir cualquier implementación de cache.
 * Esta abstracción permite:
 * - Cambiar de Redis a Memcached sin afectar la lógica de negocio
 * - Testing con implementaciones mock
 * - Mantener la independencia del dominio
 */
export abstract class CacheService {
  /**
   * Obtiene un valor del cache
   * @param key - Clave del valor a obtener
   * @returns El valor almacenado o null si no existe
   */
  abstract get<T>(key: string): Promise<T | null>;

  /**
   * Almacena un valor en el cache
   * @param key - Clave para almacenar el valor
   * @param value - Valor a almacenar
   * @param ttl - Tiempo de vida en segundos (opcional)
   */
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Elimina un valor del cache
   * @param key - Clave del valor a eliminar
   */
  abstract delete(key: string): Promise<void>;

  /**
   * Elimina múltiples valores del cache por patrón
   * @param pattern - Patrón de búsqueda (ej: "user:*")
   */
  abstract deleteByPattern(pattern: string): Promise<void>;

  /**
   * Verifica si una clave existe en el cache
   * @param key - Clave a verificar
   */
  abstract exists(key: string): Promise<boolean>;

  /**
   * Limpia todo el cache (usar con precaución)
   */
  abstract clear(): Promise<void>;

  /**
   * Obtiene múltiples valores del cache
   * @param keys - Array de claves a obtener
   */
  abstract getMany<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Almacena múltiples valores en el cache
   * @param entries - Array de tuplas [key, value, ttl?]
   */
  abstract setMany<T>(entries: [string, T, number?][]): Promise<void>;
}
