import { PromotionsClient } from '../../services/clients/promotions.client';
import { env } from '../../app/config/env';
import { CACHE_KEYS, getCacheService } from '../../services/cache';
import type { CacheService } from '../../services/cache/cache.service';
import { logger } from '../../shared/utils/logger';
import type {
  PromotionsActiveInput,
  ProxyResponse,
  RecommendationsInput,
} from './promotions.types';

const isSuccessStatus = (status: number): boolean => status >= 200 && status < 300;

const normalizeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const fallbackPromotions = {
  items: [
    {
      id: 9001,
      title: 'Combo Almuerzo',
      description: 'Bebida gratis',
    },
    {
      id: 9002,
      title: 'Entrega Premium',
      description: '10% off on your first prototype order',
    },
  ],
};

const fallbackRecommendations = {
  items: [],
};

export class PromotionsProxy {
  constructor(
    private readonly client: PromotionsClient = new PromotionsClient(),
    private readonly cacheProvider: () => Promise<CacheService> = getCacheService,
  ) {}

  public async active(input: PromotionsActiveInput): Promise<ProxyResponse> {
    const cacheKey = CACHE_KEYS.promotionsActive;
    const cache = await this.cacheProvider();

    try {
      const cached = await cache.get<unknown>(cacheKey);
      if (cached !== null) {
        return { status: 200, data: cached };
      }
    } catch (error: unknown) {
      logger.warn('Cache read failed for active promotions.', {
        cacheKey,
        error: normalizeError(error),
      });
    }

    let response: ProxyResponse;

    try {
      response = await this.client.forward({
        method: 'GET',
        path: '/promotions/active',
        query: input.query,
        context: input.context,
      });
    } catch (error: unknown) {
      logger.warn('Promotions upstream unavailable. Returning demo promotions fallback.', {
        error: normalizeError(error),
      });

      response = { status: 200, data: fallbackPromotions };
    }

    if (isSuccessStatus(response.status)) {
      try {
        await cache.set(cacheKey, response.data, env.CACHE_TTL_PROMOTIONS);
      } catch (error: unknown) {
        logger.warn('Cache write failed for active promotions.', {
          cacheKey,
          error: normalizeError(error),
        });
      }
    }

    return { status: response.status, data: response.data };
  }

  public async recommendations(input: RecommendationsInput): Promise<ProxyResponse> {
    try {
      const response = await this.client.forward({
        method: 'GET',
        path: '/recommendations',
        query: input.query,
        context: input.context,
      });

      return { status: response.status, data: response.data };
    } catch (error: unknown) {
      logger.warn('Recommendations upstream unavailable. Returning empty recommendations fallback.', {
        error: normalizeError(error),
      });

      return { status: 200, data: fallbackRecommendations };
    }
  }
}
