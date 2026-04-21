import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ID } from "@/shared/types/common.types";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { UpdateAvailabilityInput } from "@/features/products/types/products.types";

export function useUpdateAvailability(restaurantId?: ID | null) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, isAvailable }: UpdateAvailabilityInput) => {
      return repositories.catalog.updateAvailability(productId, { isAvailable });
    },
    onSuccess: async () => {
      if (restaurantId == null) {
        return;
      }

      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurantMenu(restaurantId) });
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
