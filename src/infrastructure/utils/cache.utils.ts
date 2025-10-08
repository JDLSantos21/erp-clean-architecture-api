import { CacheService } from "../../domain";

export class CacheKeyBuilder {
  /**
   * Construye clave para entidades individuales
   * Patrón: entity:id
   * Ejemplo: "user:123", "order:456"
   */
  static entity(entityName: string, id: string | number): string {
    return `${entityName}:${id}`;
  }

  /**
   * Construye clave para listados con filtros
   * Patrón: entity:list:hash(filters)
   * Ejemplo: "order:list:active_status_pending"
   */
  static list(entityName: string, filters?: Record<string, any>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return `${entityName}:list:all`;
    }
    const filterKey = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}_${value}`)
      .join("_");
    return `${entityName}:list:${filterKey}`;
  }

  /**
   * Construye clave para consultas específicas
   * Patrón: entity:query:queryName:params
   * Ejemplo: "order:query:byTrackingCode:ABC123"
   */
  static query(
    entityName: string,
    queryName: string,
    params?: string | number
  ): string {
    return params
      ? `${entityName}:query:${queryName}:${params}`
      : `${entityName}:query:${queryName}`;
  }

  /**
   * Construye clave para agregaciones
   * Patrón: entity:aggregate:type:params
   * Ejemplo: "order:aggregate:count:status_pending"
   */
  static aggregate(entityName: string, type: string, params?: string): string {
    return params
      ? `${entityName}:aggregate:${type}:${params}`
      : `${entityName}:aggregate:${type}`;
  }

  /**
   * Construye patrón para invalidar múltiples claves
   * Patrón: entity:*
   * Ejemplo: "user:*" (borra todas las claves relacionadas con usuarios)
   */
  static pattern(entityName: string, subPattern?: string): string {
    return subPattern ? `${entityName}:${subPattern}:*` : `${entityName}:*`;
  }
}

/**
 * Cache Invalidator
 *
 * Estrategias de invalidación de cache para mantener
 * la consistencia de datos.
 */
export class CacheInvalidator {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalida una entidad específica
   */
  async invalidateEntity(
    entityName: string,
    id: string | number
  ): Promise<void> {
    const key = CacheKeyBuilder.entity(entityName, id);
    await this.cacheService.delete(key);
  }

  /**
   * Invalida todos los listados de una entidad
   */
  async invalidateLists(entityName: string): Promise<void> {
    const pattern = CacheKeyBuilder.pattern(entityName, "list");
    await this.cacheService.deleteByPattern(pattern);
  }

  /**
   * Invalida todas las queries de una entidad
   */
  async invalidateQueries(entityName: string): Promise<void> {
    const pattern = CacheKeyBuilder.pattern(entityName, "query");
    await this.cacheService.deleteByPattern(pattern);
  }

  /**
   * Invalida todas las agregaciones de una entidad
   */
  async invalidateAggregates(entityName: string): Promise<void> {
    const pattern = CacheKeyBuilder.pattern(entityName, "aggregate");
    await this.cacheService.deleteByPattern(pattern);
  }

  /**
   * Invalida todo el cache de una entidad
   * (usar cuando se crea, actualiza o elimina)
   */
  async invalidateAll(entityName: string): Promise<void> {
    const pattern = CacheKeyBuilder.pattern(entityName);
    await this.cacheService.deleteByPattern(pattern);
  }

  /**
   * Invalida múltiples entidades relacionadas
   * Ejemplo: Al actualizar una orden, invalidar orden, items y customer
   */
  async invalidateRelated(entityNames: string[]): Promise<void> {
    await Promise.all(
      entityNames.map((entityName) => this.invalidateAll(entityName))
    );
  }
}

/**
 * Cache TTL Constants
 *
 * Tiempos de vida recomendados para diferentes tipos de datos
 */
export const CacheTTL = {
  // Datos que cambian raramente
  STATIC: 3600, // 1 hora

  // Datos que cambian ocasionalmente
  SEMI_STATIC: 1800, // 30 minutos

  // Datos que cambian frecuentemente
  DYNAMIC: 300, // 5 minutos

  // Datos de sesión/autenticación
  SESSION: 900, // 15 minutos

  // Datos que cambian muy frecuentemente
  VOLATILE: 60, // 1 minuto

  // Datos para rate limiting
  RATE_LIMIT: 3600, // 1 hora
} as const;
