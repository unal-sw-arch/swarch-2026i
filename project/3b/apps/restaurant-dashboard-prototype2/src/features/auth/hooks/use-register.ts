import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import type { RestaurantRegisterRequest } from "@/features/auth/types/auth.types";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useRegister() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  const registerMutation = useMutation({
    mutationFn: (payload: RestaurantRegisterRequest) => repositories.auth.registerRestaurant(payload),
    onSuccess: (response) => {
      login(response);
      queryClient.setQueryData(QUERY_KEYS.authSession, response);
    },
  });

  return {
    registerRestaurant: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    resetRegisterError: registerMutation.reset,
  };
}
