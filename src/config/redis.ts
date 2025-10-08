import { Redis as UpstashRedis } from "@upstash/redis";
import Redis from "ioredis";
import { envs } from "./envs";
import { Logger } from "../domain";

/**
 * Redis Client Type
 * Union type para soportar ambos clientes
 */
export type RedisClientType = UpstashRedis | Redis;

/**
 * Redis Client Adapter
 * Capa de abstracción que soporta múltiples implementaciones de Redis
 * - IORedis: Para desarrollo local o Redis nativo en producción
 * - Upstash: Para ambientes serverless o cloud
 */
export class RedisAdapter {
  private static client: RedisClientType | null = null;

  /**
   * Obtiene o crea la instancia del cliente Redis según configuración
   */
  static getClient(): RedisClientType {
    if (!this.client) {
      this.client = this.createClient();
    }
    return this.client;
  }

  /**
   * Factory method para crear el cliente según CACHE_PROVIDER
   */
  private static createClient(): RedisClientType {
    const provider = envs.CACHE_PROVIDER;

    switch (provider) {
      case "ioredis":
        return this.createIORedisClient();

      case "upstash":
        return this.createUpstashClient();

      default:
        Logger.warn(
          `Unknown CACHE_PROVIDER: ${provider}, defaulting to ioredis`
        );
        return this.createIORedisClient();
    }
  }

  private static createIORedisClient(): Redis {
    const config = {
      host: envs.REDIS_HOST,
      port: envs.REDIS_PORT,
      db: envs.REDIS_DB,
      password: envs.REDIS_PASSWORD || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };

    const client = new Redis(config);

    // Event handlers
    client.on("connect", () => {
      console.log("✅ IORedis connected successfully");
    });

    client.on("error", (err) => {
      console.error("❌ IORedis connection error:", err.message);
    });

    client.on("close", () => {
      console.warn("⚠️  IORedis connection closed");
    });

    return client;
  }

  private static createUpstashClient(): UpstashRedis {
    if (!envs.UPSTASH_REDIS_REST_URL || !envs.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for Upstash provider"
      );
    }

    return new UpstashRedis({
      url: envs.UPSTASH_REDIS_REST_URL,
      token: envs.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  /**
   * Cierra la conexión (útil para testing y shutdown graceful)
   */
  static async disconnect(): Promise<void> {
    if (this.client) {
      if (this.client instanceof Redis) {
        await this.client.quit();
      }
      this.client = null;
    }
  }

  /**
   * Verifica la conexión con Redis
   */
  static async ping(): Promise<boolean> {
    try {
      const client = this.getClient();
      const result = await client.ping();
      return result === "PONG";
    } catch (error) {
      Logger.error("Redis connection failed:", error);
      return false;
    }
  }

  /**
   * Obtiene el tipo de proveedor actual
   */
  static getProvider(): string {
    return envs.CACHE_PROVIDER;
  }

  /**
   * Verifica si el cliente es IORedis
   */
  static isIORedis(client: RedisClientType): client is Redis {
    return client instanceof Redis;
  }

  /**
   * Verifica si el cliente es Upstash
   */
  static isUpstash(client: RedisClientType): client is UpstashRedis {
    return !this.isIORedis(client);
  }
}
