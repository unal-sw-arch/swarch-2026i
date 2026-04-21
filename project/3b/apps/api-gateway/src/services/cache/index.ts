import type { CacheService } from './cache.service';
import { createOptionalCacheService } from './redis.factory';

let cacheServicePromise: Promise<CacheService> | null = null;

export const getCacheService = (): Promise<CacheService> => {
  if (!cacheServicePromise) {
    cacheServicePromise = createOptionalCacheService().catch((error: unknown) => {
      cacheServicePromise = null;
      throw error;
    });
  }

  return cacheServicePromise;
};

export const CACHE_KEYS = {
  catalogRestaurants: 'gateway:catalog:restaurants',
  catalogRestaurantMenu: (restaurantId: string) => `gateway:catalog:restaurant:${restaurantId}:menu`,
  promotionsActive: 'gateway:promotions:active',
} as const;
