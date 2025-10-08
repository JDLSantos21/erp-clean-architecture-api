import { CacheService, Logger } from "../../domain";
import { RedisAdapter, RedisClientType } from "../../config";

/**
 * Redis Cache Service (Infrastructure Layer)
 *
 * Implementación concreta del CacheService usando Redis.
 * Soporta múltiples proveedores:
 * - IORedis: Para Redis nativo (local o producción)
 * - Upstash: Para ambientes serverless
 *
 * Esta clase pertenece a la capa de infraestructura porque:
 * - Depende de tecnologías específicas
 * - Implementa detalles técnicos de almacenamiento
 * - Maneja errores de infraestructura
 */
export class RedisCacheService extends CacheService {
  constructor(private readonly redisClient: RedisClientType) {
    super();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      let value: T | null = null;

      if (RedisAdapter.isIORedis(this.redisClient)) {
        // IORedis: get retorna string | null
        const rawValue = await this.redisClient.get(key);
        value = rawValue ? JSON.parse(rawValue) : null;
      } else {
        // Upstash: get ya retorna el tipo esperado
        value = await this.redisClient.get<T>(key);
      }

      if (value !== null) {
        Logger.debug(`Cache HIT: ${key}`);
      } else {
        Logger.debug(`Cache MISS: ${key}`);
      }

      return value;
    } catch (error) {
      Logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (RedisAdapter.isIORedis(this.redisClient)) {
        // IORedis
        if (ttl) {
          await this.redisClient.setex(key, ttl, serializedValue);
        } else {
          await this.redisClient.set(key, serializedValue);
        }
      } else {
        // Upstash
        if (ttl) {
          await this.redisClient.setex(key, ttl, serializedValue);
        } else {
          await this.redisClient.set(key, serializedValue);
        }
      }

      Logger.debug(`Cache SET: ${key} (TTL: ${ttl || "none"})`);
    } catch (error) {
      Logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      Logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      Logger.error(`Cache DELETE error for key ${key}:`, error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      let keys: string[] = [];

      if (RedisAdapter.isIORedis(this.redisClient)) {
        // IORedis: usar SCAN para evitar bloquear el servidor
        keys = await this.scanKeys(pattern);
      } else {
        // Upstash: usar keys (es REST API, no bloquea)
        keys = await this.redisClient.keys(pattern);
      }

      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        Logger.debug(`Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      Logger.error(`Cache DELETE pattern error for ${pattern}:`, error);
    }
  }

  /**
   * SCAN keys usando IORedis (más eficiente que KEYS)
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    if (!RedisAdapter.isIORedis(this.redisClient)) {
      return [];
    }

    const keys: string[] = [];
    let cursor = "0";

    do {
      const [nextCursor, foundKeys] = await this.redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      keys.push(...foundKeys);
    } while (cursor !== "0");

    return keys;
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      Logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redisClient.flushdb();
      Logger.warn("Cache cleared (FLUSHDB)");
    } catch (error) {
      Logger.error("Cache CLEAR error:", error);
    }
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];

      if (RedisAdapter.isIORedis(this.redisClient)) {
        // IORedis: mget retorna (string | null)[]
        const rawValues = await this.redisClient.mget(...keys);
        const values = rawValues.map((val) => (val ? JSON.parse(val) : null));
        Logger.debug(`Cache MGET: ${keys.length} keys`);
        return values;
      } else {
        // Upstash: mget retorna el tipo esperado
        const values = await this.redisClient.mget<T[]>(...keys);
        Logger.debug(`Cache MGET: ${keys.length} keys`);
        return values;
      }
    } catch (error) {
      Logger.error("Cache MGET error:", error);
      return keys.map(() => null);
    }
  }

  async setMany<T>(entries: [string, T, number?][]): Promise<void> {
    try {
      if (RedisAdapter.isIORedis(this.redisClient)) {
        // IORedis: usar pipeline
        const pipeline = this.redisClient.pipeline();

        entries.forEach(([key, value, ttl]) => {
          const serializedValue = JSON.stringify(value);
          if (ttl) {
            pipeline.setex(key, ttl, serializedValue);
          } else {
            pipeline.set(key, serializedValue);
          }
        });

        await pipeline.exec();
      } else {
        // Upstash: usar pipeline
        const pipeline = this.redisClient.pipeline();

        entries.forEach(([key, value, ttl]) => {
          if (ttl) {
            pipeline.setex(key, ttl, JSON.stringify(value));
          } else {
            pipeline.set(key, JSON.stringify(value));
          }
        });

        await pipeline.exec();
      }

      Logger.debug(`Cache MSET: ${entries.length} keys`);
    } catch (error) {
      Logger.error("Cache MSET error:", error);
    }
  }
}
