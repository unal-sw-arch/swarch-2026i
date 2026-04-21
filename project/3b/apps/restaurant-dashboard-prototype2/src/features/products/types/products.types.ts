import type { ID } from "@/shared/types/common.types";

export type MenuProduct = {
  id: ID;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  restaurantId: ID;
};

export type RestaurantMenuResponse = {
  restaurantId: ID;
  items: MenuProduct[];
};

export type UpdateAvailabilityRequest = {
  id: ID;
  restaurantId: ID;
  isAvailable: boolean;
};

export type UpdateAvailabilityResponse = {
  id: ID;
  isAvailable: boolean;
  message?: string;
};

export type UpdateAvailabilityPayload = {
  isAvailable: boolean;
};

export type UpdateAvailabilityInput = {
  productId: ID;
  isAvailable: boolean;
};
