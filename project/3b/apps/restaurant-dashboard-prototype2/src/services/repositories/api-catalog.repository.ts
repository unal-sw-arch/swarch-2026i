import type { MenuProduct, UpdateAvailabilityPayload, UpdateAvailabilityResponse } from "@/features/products/types/products.types";
import { adaptRestaurantMenuResponse, adaptUpdateAvailabilityResponse } from "@/services/adapters/catalog.adapter";
import { httpClient } from "@/services/api/http-client";
import type { CatalogRepository } from "@/services/repositories/catalog.repository";

export const apiCatalogRepository: CatalogRepository = {
  async getRestaurantMenu(restaurantId: number): Promise<MenuProduct[]> {
    const response = await httpClient.get<unknown>(`/restaurants/${restaurantId}/menu`);
    return adaptRestaurantMenuResponse(response.data);
  },

  async updateAvailability(productId: MenuProduct["id"], payload: UpdateAvailabilityPayload): Promise<UpdateAvailabilityResponse> {
    const response = await httpClient.patch<unknown>(`/menu-items/${productId}/availability`, payload);
    return adaptUpdateAvailabilityResponse(response.data);
  },
};
