import { z } from 'zod';

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    const normalizedValue = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
      return true;
    }

    if (['false', '0', 'no', 'off', ''].includes(normalizedValue)) {
      return false;
    }

    throw new Error(`Invalid boolean value: ${value}`);
  });

const rawEnv = {
  ...process.env,
  HTTP_TIMEOUT_MS: process.env.HTTP_TIMEOUT_MS ?? process.env.UPSTREAM_TIMEOUT_MS,
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL ?? process.env.ORDERS_SERVICE_URL,
};

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    BODY_LIMIT: z.string().min(1).default('1mb'),
    HTTP_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    AUTH_SERVICE_URL: z.string().url(),
    CATALOG_SERVICE_URL: z.string().url(),
    ORDER_SERVICE_URL: z.string().url(),
    KITCHEN_SERVICE_URL: z.string().url(),
    TIMELINE_SERVICE_URL: z.string().url(),
    PROMOTIONS_SERVICE_URL: z.string().url(),
    CACHE_ENABLED: booleanFromEnv.default(false),
    REDIS_URL: z.string().url().optional(),
    CACHE_TTL_RESTAURANTS: z.coerce.number().int().positive().default(60),
    CACHE_TTL_MENU: z.coerce.number().int().positive().default(60),
    CACHE_TTL_PROMOTIONS: z.coerce.number().int().positive().default(60),
    USE_MOCK_SERVICES: booleanFromEnv.default(false),
    // WAF (Web Application Firewall) — input inspection at the edge.
    WAF_ENABLED: booleanFromEnv.default(true),
    WAF_MODE: z.enum(['detect', 'block']).default('block'),
    WAF_MAX_BODY_BYTES: z.coerce.number().int().positive().default(1048576),
    // Throttling / Rate Limiting (per-IP, Redis-backed).
    THROTTLE_ENABLED: booleanFromEnv.default(true),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    THROTTLE_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    // Resilience (Retry + Circuit Breaker) towards upstream services.
    RESILIENCE_ENABLED: booleanFromEnv.default(true),
    RETRY_MAX_ATTEMPTS: z.coerce.number().int().min(0).default(2),
    RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(100),
    BREAKER_FAILURE_THRESHOLD: z.coerce.number().int().positive().default(5),
    BREAKER_RESET_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  });

export type EnvConfig = Readonly<z.infer<typeof envSchema>>;

export const env: EnvConfig = Object.freeze(envSchema.parse(rawEnv));
