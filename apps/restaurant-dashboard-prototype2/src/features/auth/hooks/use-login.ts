import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import type { RestaurantLoginRequest } from "@/features/auth/types/auth.types";
import { repositories } from "@/services/repositories";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  const loginMutation = useMutation({
    mutationFn: (payload: RestaurantLoginRequest) => repositories.auth.loginRestaurant(payload),
    onSuccess: (response) => {
      login(response);
      queryClient.setQueryData(QUERY_KEYS.authSession, response);
    },
  });

  return {
    loginRestaurant: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    resetLoginError: loginMutation.reset,
  };
}
