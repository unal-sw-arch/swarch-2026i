import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useRestaurantMenu(restaurantId?: string | number | null) {
  const normalizedRestaurantId = restaurantId != null ? Number(restaurantId) : null;
  const hasValidRestaurantId = normalizedRestaurantId != null && Number.isFinite(normalizedRestaurantId);

  return useQuery({
    queryKey: QUERY_KEYS.restaurantMenu(normalizedRestaurantId ?? ""),
    queryFn: () => {
      if (!hasValidRestaurantId) {
        throw new Error("No se encontró un restaurante válido para cargar productos.");
      }

      return repositories.catalog.getRestaurantMenu(normalizedRestaurantId);
    },
    enabled: hasValidRestaurantId,
  });
}
