import { createClient, type RedisClientType } from 'redis';
import { env } from '../../app/config/env';
import { NoopCacheService } from '../../shared/lib/noop-cache';
import { logger } from '../../shared/utils/logger';
import type { CacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';

export type RedisClient = RedisClientType;

const noopCacheService = new NoopCacheService();

const createRedisClient = (): RedisClient => {
  return createClient({
    url: env.REDIS_URL,
  });
};

export const createRedisCacheService = (client: RedisClient): CacheService => {
  return new RedisCacheService(client);
};

export const createOptionalCacheService = async (): Promise<CacheService> => {
  if (!env.CACHE_ENABLED) {
    logger.info('Cache disabled. Using NoopCacheService.');
    return noopCacheService;
  }

  if (!env.REDIS_URL) {
    logger.warn('Cache enabled but REDIS_URL is missing. Falling back to NoopCacheService.');
    return noopCacheService;
  }

  const client = createRedisClient();

  client.on('error', (error: unknown) => {
    logger.warn('Redis client error. Cache operations may fail and fallback to upstream.', {
      error: error instanceof Error ? error.message : String(error),
    });
  });

  try {
    await client.connect();
    logger.info('Redis cache enabled.');
    return createRedisCacheService(client);
  } catch (error: unknown) {
    logger.warn('Failed to connect to Redis. Falling back to NoopCacheService.', {
      error: error instanceof Error ? error.message : String(error),
    });
    return noopCacheService;
  }
};
