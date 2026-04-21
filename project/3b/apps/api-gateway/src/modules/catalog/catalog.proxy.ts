import { CatalogClient } from '../../services/clients/catalog.client';
import { env } from '../../app/config/env';
import { CACHE_KEYS, getCacheService } from '../../services/cache';
import type { CacheService } from '../../services/cache/cache.service';
import { logger } from '../../shared/utils/logger';
import type {
  ListRestaurantsInput,
  ProxyResponse,
  RestaurantMenuInput,
  UpdateMenuItemAvailabilityInput,
} from './catalog.types';

const isSuccessStatus = (status: number): boolean => status >= 200 && status < 300;

const normalizeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export class CatalogProxy {
  constructor(
    private readonly client: CatalogClient = new CatalogClient(),
    private readonly cacheProvider: () => Promise<CacheService> = getCacheService,
  ) {}

  public async listRestaurants(input: ListRestaurantsInput): Promise<ProxyResponse> {
    const cacheKey = CACHE_KEYS.catalogRestaurants;
    const cache = await this.cacheProvider();

    try {
      const cached = await cache.get<unknown>(cacheKey);
      if (cached !== null) {
        return { status: 200, data: cached };
      }
    } catch (error: unknown) {
      logger.warn('Cache read failed for restaurants list.', {
        cacheKey,
        error: normalizeError(error),
      });
    }

    const response = await this.client.forward({
      method: 'GET',
      path: '/restaurants',
      query: input.query,
      context: input.context,
    });

    if (isSuccessStatus(response.status)) {
      try {
        await cache.set(cacheKey, response.data, env.CACHE_TTL_RESTAURANTS);
      } catch (error: unknown) {
        logger.warn('Cache write failed for restaurants list.', {
          cacheKey,
          error: normalizeError(error),
        });
      }
    }

    return { status: response.status, data: response.data };
  }

  public async restaurantMenu(input: RestaurantMenuInput): Promise<ProxyResponse> {
    const cacheKey = CACHE_KEYS.catalogRestaurantMenu(input.restaurantId);
    const cache = await this.cacheProvider();

    try {
      const cached = await cache.get<unknown>(cacheKey);
      if (cached !== null) {
        return { status: 200, data: cached };
      }
    } catch (error: unknown) {
      logger.warn('Cache read failed for restaurant menu.', {
        cacheKey,
        restaurantId: input.restaurantId,
        error: normalizeError(error),
      });
    }

    const response = await this.client.forward({
      method: 'GET',
      path: `/restaurants/${input.restaurantId}/menu`,
      context: input.context,
    });

    if (isSuccessStatus(response.status)) {
      try {
        await cache.set(cacheKey, response.data, env.CACHE_TTL_MENU);
      } catch (error: unknown) {
        logger.warn('Cache write failed for restaurant menu.', {
          cacheKey,
          restaurantId: input.restaurantId,
          error: normalizeError(error),
        });
      }
    }

    return { status: response.status, data: response.data };
  }

  public async menuItemAvailability(input: UpdateMenuItemAvailabilityInput): Promise<ProxyResponse> {
    const response = await this.client.forward({
      method: 'PATCH',
      path: `/menu-items/${input.menuItemId}/availability`,
      body: input.body,
      context: input.context,
    });

    return { status: response.status, data: response.data };
  }
}
