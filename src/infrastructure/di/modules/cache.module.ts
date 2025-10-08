import { RedisAdapter } from "../../../config";
import { RedisCacheService } from "../../services";
import { IDIContainer } from "../types";

export const registerCacheModule = (container: IDIContainer): void => {
  container.registerSingleton("CacheService", () => {
    const redisClient = RedisAdapter.getClient();
    return new RedisCacheService(redisClient);
  });
};
