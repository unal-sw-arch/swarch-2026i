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
    WAF_ENABLED: booleanFromEnv.default(true),
    WAF_MODE: z.enum(['detect', 'block']).default('block'),
    WAF_MAX_BODY_BYTES: z.coerce.number().int().positive().default(1048576),
  });

export type EnvConfig = Readonly<z.infer<typeof envSchema>>;

export const env: EnvConfig = Object.freeze(envSchema.parse(rawEnv));
