import type {
  RestaurantLoginRequest,
  RestaurantLoginResponse,
} from "@/features/auth/types/auth.types";

export interface AuthRepository {
  loginRestaurant: (payload: RestaurantLoginRequest) => Promise<RestaurantLoginResponse>;
}
