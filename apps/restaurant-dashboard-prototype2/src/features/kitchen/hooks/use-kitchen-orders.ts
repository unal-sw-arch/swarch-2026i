import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useKitchenOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.kitchenOrders,
    queryFn: () => repositories.kitchen.getKitchenOrders(),
  });
}
