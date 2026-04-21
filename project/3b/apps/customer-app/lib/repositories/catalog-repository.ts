import "server-only";

import { GatewayClient } from "@/lib/gateway-client";
import type {
  RecommendationsResponse,
  RestaurantMenu,
  RestaurantsResponse,
} from "@/lib/types";

const gatewayClient = new GatewayClient();

export const CatalogRepository = {
  async getRestaurants() {
    try {
      return await gatewayClient.get<RestaurantsResponse>("/restaurants");
    } catch {
      return { items: [] };
    }
  },

  async getRestaurantMenu(restaurantId: number) {
    try {
      return await gatewayClient.get<RestaurantMenu>(
        `/restaurants/${restaurantId}/menu`,
      );
    } catch {
      return null;
    }
  },

  async getRecommendations(restaurantId: number) {
    try {
      return await gatewayClient.get<RecommendationsResponse>(
        `/recommendations?restaurantId=${restaurantId}`,
      );
    } catch {
      return { items: [] };
    }
  },
};
