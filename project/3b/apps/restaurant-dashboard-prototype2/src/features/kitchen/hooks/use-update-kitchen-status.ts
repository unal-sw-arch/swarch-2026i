import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { KitchenOrder, KitchenOrderStatus } from "@/features/kitchen/types/kitchen.types";

type UseUpdateKitchenStatusParams = {
  orderId: KitchenOrder["orderId"];
  status: KitchenOrderStatus;
};

export function useUpdateKitchenStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ orderId, status }: UseUpdateKitchenStatusParams) =>
      repositories.kitchen.updateKitchenOrderStatus({ orderId, status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenOrders });
      // Opcional: Invalidar restaurantOrders si existe (para sincronización)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurantOrders });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
