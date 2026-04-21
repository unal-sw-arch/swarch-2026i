import { ENV } from "@/app/config/env";
import { authMockRepository } from "@/mocks/repositories/auth.mock.repository";
import { catalogMockRepository } from "@/mocks/repositories/catalog.mock.repository";
import { kitchenMockRepository } from "@/mocks/repositories/kitchen.mock.repository";
import { ordersMockRepository } from "@/mocks/repositories/orders.mock.repository";
import { apiAuthRepository } from "@/services/repositories/api-auth.repository";
import { apiCatalogRepository } from "@/services/repositories/api-catalog.repository";
import { apiKitchenRepository } from "@/services/repositories/api-kitchen.repository";
import { apiOrdersRepository } from "@/services/repositories/api-orders.repository";

const repositoryBySource = {
  mock: {
    authRepository: authMockRepository,
    ordersRepository: ordersMockRepository,
    kitchenRepository: kitchenMockRepository,
    catalogRepository: catalogMockRepository,
  },
  api: {
    authRepository: apiAuthRepository,
    ordersRepository: apiOrdersRepository,
    kitchenRepository: apiKitchenRepository,
    catalogRepository: apiCatalogRepository,
  },
} as const;

const selectedRepositories = repositoryBySource[ENV.dataSource];

export const authRepository = selectedRepositories.authRepository;
export const ordersRepository = selectedRepositories.ordersRepository;
export const kitchenRepository = selectedRepositories.kitchenRepository;
export const catalogRepository = selectedRepositories.catalogRepository;

export const repositories = {
  auth: authRepository,
  orders: ordersRepository,
  kitchen: kitchenRepository,
  catalog: catalogRepository,
};
