import { restaurantsMock } from "@/lib/mocks/restaurants.mock";
import type { Restaurant } from "@/lib/types";

const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? "http://localhost:8080";

interface RestaurantCardApiResponse {
  id: number | string;
  name: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  price?: string;
  badge?: string;
  category?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

const normalizeRestaurant = (item: RestaurantCardApiResponse): Restaurant => ({
  id: String(item.id),
  name: item.name ?? "Restaurante",
  image: item.image ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=700&fit=crop&auto=format",
  rating: typeof item.rating === "number" ? item.rating : 4.0,
  deliveryTime: item.deliveryTime ?? "30 min",
  price: item.price ?? "$ 0",
  badge: item.badge,
  category: item.category ?? "General",
  city: item.city ?? "Bogota",
  latitude: typeof item.latitude === "number" ? item.latitude : 4.711,
  longitude: typeof item.longitude === "number" ? item.longitude : -74.0721,
});

export const restaurantService = {
  async getAll(): Promise<Restaurant[]> {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(`${API_GATEWAY_BASE}/restaurant/cards`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as RestaurantCardApiResponse[];
      if (!Array.isArray(data)) {
        return [...restaurantsMock];
      }

      return data.map(normalizeRestaurant);
    } catch (error) {
      console.warn("Falling back to frontend mocks for restaurants:", error);
      return [...restaurantsMock];
    }
  },
};

