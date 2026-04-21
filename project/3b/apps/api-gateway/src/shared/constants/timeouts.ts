import { env } from '../../app/config/env';

export const TIMEOUTS = {
  upstreamTimeoutMs: env.HTTP_TIMEOUT_MS,
  cacheRestaurantsTtlSeconds: env.CACHE_TTL_RESTAURANTS,
  cacheMenuTtlSeconds: env.CACHE_TTL_MENU,
  cachePromotionsTtlSeconds: env.CACHE_TTL_PROMOTIONS,
} as const;
