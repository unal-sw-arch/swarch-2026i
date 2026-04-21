import { env } from './env';

export interface ServiceConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
}

export type ServiceName =
  | 'auth'
  | 'catalog'
  | 'orders'
  | 'kitchen'
  | 'timeline'
  | 'promotions';

const createServiceConfig = (baseUrl: string): ServiceConfig =>
  Object.freeze({
    baseUrl,
    timeoutMs: env.HTTP_TIMEOUT_MS,
  });

export const services: Readonly<Record<ServiceName, ServiceConfig>> = Object.freeze({
  auth: createServiceConfig(env.AUTH_SERVICE_URL),
  catalog: createServiceConfig(env.CATALOG_SERVICE_URL),
  orders: createServiceConfig(env.ORDER_SERVICE_URL),
  kitchen: createServiceConfig(env.KITCHEN_SERVICE_URL),
  timeline: createServiceConfig(env.TIMELINE_SERVICE_URL),
  promotions: createServiceConfig(env.PROMOTIONS_SERVICE_URL),
});

export const serviceRuntime = Object.freeze({
  useMockServices: env.USE_MOCK_SERVICES,
});
