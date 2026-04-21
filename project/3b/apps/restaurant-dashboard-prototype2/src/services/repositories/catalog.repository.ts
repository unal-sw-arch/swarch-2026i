import type {
  MenuProduct,
  UpdateAvailabilityPayload,
  UpdateAvailabilityResponse,
} from "@/features/products/types/products.types";

export interface CatalogRepository {
  getRestaurantMenu: (restaurantId: number) => Promise<MenuProduct[]>;
  updateAvailability: (productId: MenuProduct["id"], payload: UpdateAvailabilityPayload) => Promise<UpdateAvailabilityResponse>;
}
