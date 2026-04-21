import { useAuthStore } from "@/app/store/auth.store";
import type { RestaurantLoginResponse } from "@/features/auth/types/auth.types";

export function useAuthSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const userId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const session: RestaurantLoginResponse | null =
    isAuthenticated && accessToken && role && restaurantId != null && userId != null
      ? {
          accessToken,
          role,
          restaurantId,
          userId,
        }
      : null;

  return {
    session,
    role,
    restaurantId,
    userId,
    isAuthenticated,
    isHydrated,
  };
}
