import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useRestaurantOrders(restaurantId?: string | number | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.restaurantOrders, restaurantId ?? "unknown"],
    queryFn: () => repositories.orders.getRestaurantOrders(),
    enabled: Boolean(restaurantId),
    staleTime: 30_000,
  });
}
