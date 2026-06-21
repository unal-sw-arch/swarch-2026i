import { createClient, type RedisClientType } from 'redis';
import { env } from '../app/config/env';
import { AppError } from '../app/errors/app-error';
import { GatewayErrorCode } from '../app/errors/error-codes';
import { logger } from '../shared/utils/logger';
import { ROUTES } from '../shared/constants/routes';
import { asyncHandler } from '../shared/utils/async-handler';

/**
 * Throttling / Rate Limiting (Performance & Availability tactic).
 *
 * Contador de ventana fija por IP almacenado en Redis/Valkey. Limita a
 * THROTTLE_LIMIT peticiones por THROTTLE_WINDOW_SECONDS; al exceder responde
 * 429 con cabecera Retry-After. Falla en modo abierto (fail-open): si Redis no
 * está disponible, deja pasar la petición en lugar de tumbar el gateway.
 */

let throttleClient: RedisClientType | null = null;
let throttleClientReady = false;

const getThrottleClient = async (): Promise<RedisClientType | null> => {
  if (!env.THROTTLE_ENABLED || !env.REDIS_URL) {
    return null;
  }

  if (throttleClient && throttleClientReady) {
    return throttleClient;
  }

  if (!throttleClient) {
    throttleClient = createClient({ url: env.REDIS_URL });

    throttleClient.on('error', (error: Error) => {
      logger.warn('Throttle Redis error.', { error: error.message });
      throttleClientReady = false;
    });

    throttleClient.on('ready', () => {
      throttleClientReady = true;
    });

    try {
      await throttleClient.connect();
      throttleClientReady = true;
      logger.info('Throttle Redis connected.');
    } catch (error: unknown) {
      logger.warn('Throttle Redis connect failed.', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return throttleClientReady ? throttleClient : null;
};

const getClientIp = (req: import('express').Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
};

export const throttleMiddleware = asyncHandler(async (req, res, next) => {
  if (req.path === ROUTES.health || !env.THROTTLE_ENABLED) {
    return next();
  }

  const client = await getThrottleClient();
  if (!client) {
    // fail-open: sin Redis no bloqueamos tráfico.
    return next();
  }

  const ip = getClientIp(req);
  const windowSlot = Math.floor(Date.now() / 1000 / env.THROTTLE_WINDOW_SECONDS);
  const key = `throttle:${ip}:${windowSlot}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, env.THROTTLE_WINDOW_SECONDS * 2);
    }

    const remaining = Math.max(0, env.THROTTLE_LIMIT - count);
    const resetAt = (windowSlot + 1) * env.THROTTLE_WINDOW_SECONDS;

    res.setHeader('X-RateLimit-Limit', env.THROTTLE_LIMIT);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetAt);

    if (count > env.THROTTLE_LIMIT) {
      const retryAfter = Math.max(1, resetAt - Math.floor(Date.now() / 1000));
      res.setHeader('Retry-After', retryAfter);

      logger.warn('Rate limit exceeded.', {
        ip,
        path: req.path,
        count,
        limit: env.THROTTLE_LIMIT,
      });

      throw new AppError(
        GatewayErrorCode.RATE_LIMIT_EXCEEDED,
        `Too many requests. Limit: ${env.THROTTLE_LIMIT} req/${env.THROTTLE_WINDOW_SECONDS}s.`,
        429,
      );
    }

    return next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    // Error de Redis durante el chequeo -> fail-open.
    logger.warn('Throttle check failed, skipping.', {
      ip,
      path: req.path,
      error: error instanceof Error ? error.message : String(error),
    });
    return next();
  }
});
