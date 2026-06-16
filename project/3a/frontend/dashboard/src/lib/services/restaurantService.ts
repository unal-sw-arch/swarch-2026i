import type { Restaurant, RestaurantMenuItem } from "@/lib/types";

const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? "";

const RESTAURANT_IMAGE_PLACEHOLDER = "https://placehold.co/600x400?text=Restaurante";
const MENU_ITEM_IMAGE_PLACEHOLDER = "https://placehold.co/100x100?text=Plato";

interface RestaurantCardApiResponse {
  id: number | string;
  name: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  price?: string;
  badge?: string;
  freeShipping?: boolean;
  category?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

interface MenuItemApiResponse {
  id: string;
  name: string;
  description?: string;
  price?: number | string;
  imageUrl?: string;
}

export interface RestaurantDetailsApiResponse {
  id: number | string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  placeType?: string | null;
  locationId?: number | null;
  layoutCols?: number | null;
  layoutRows?: number | null;
}

const normalizeRestaurant = (item: RestaurantCardApiResponse): Restaurant => ({
  id: String(item.id),
  name: item.name ?? "Restaurante",
  image: item.image?.trim() ? item.image : RESTAURANT_IMAGE_PLACEHOLDER,
  rating: typeof item.rating === "number" ? item.rating : 4.0,
  deliveryTime: item.deliveryTime ?? "30 min",
  price: item.price ?? "$ 0",
  badge: item.badge,
  freeShipping: item.freeShipping ?? false,
  category: item.category ?? "General",
  city: item.city ?? "Bogota",
  latitude: typeof item.latitude === "number" ? item.latitude : 4.711,
  longitude: typeof item.longitude === "number" ? item.longitude : -74.0721,
  distanceKm: typeof item.distanceKm === "number" ? item.distanceKm : undefined,
});

const normalizeRestaurantDetails = (item: RestaurantDetailsApiResponse): RestaurantDetailsApiResponse => ({
  ...item,
  layoutCols: item.layoutCols ?? 16,
  layoutRows: item.layoutRows ?? 12,
});

const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return "$ 0";
  if (typeof price === "string") return price;
  return `$ ${Number(price).toLocaleString("es-CO")}`;
};

export const restaurantService = {
  async getById(restaurantId: number | string): Promise<RestaurantDetailsApiResponse> {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_GATEWAY_BASE}/restaurant/${restaurantId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeRestaurantDetails((await response.json()) as RestaurantDetailsApiResponse);
  },

  async updateLayout(restaurantId: number | string, layout: { layoutCols: number; layoutRows: number }): Promise<RestaurantDetailsApiResponse> {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_GATEWAY_BASE}/restaurant/${restaurantId}/layout`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(layout),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return normalizeRestaurantDetails((await response.json()) as RestaurantDetailsApiResponse);
  },

  async getAll(lat?: number, lng?: number): Promise<Restaurant[]> {
    const token = localStorage.getItem("auth_token");
    const params = new URLSearchParams();
    if (lat !== undefined) params.set("lat", String(lat));
    if (lng !== undefined) params.set("lng", String(lng));
    const query = params.toString() ? `?${params}` : "";
    const response = await fetch(`${API_GATEWAY_BASE}/restaurant/cards${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as RestaurantCardApiResponse[];
    return Array.isArray(data) ? data.map(normalizeRestaurant) : [];
  },

  async getMenuItems(restaurantId: string | number): Promise<RestaurantMenuItem[]> {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_GATEWAY_BASE}/menu/restaurants/${restaurantId}/items`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) return [];
    const data = (await response.json()) as MenuItemApiResponse[];
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      const raw = item.price;
      const priceNumber =
        typeof raw === "number"
          ? raw
          : typeof raw === "string" && raw !== ""
            ? parseFloat(raw)
            : undefined;
      return {
        id: item.id,
        name: item.name ?? "Plato",
        description: item.description ?? "",
        price: formatPrice(item.price),
        priceNumber: priceNumber != null && !isNaN(priceNumber) ? priceNumber : undefined,
        image: item.imageUrl?.trim() ? item.imageUrl : MENU_ITEM_IMAGE_PLACEHOLDER,
      };
    });
  },
};
