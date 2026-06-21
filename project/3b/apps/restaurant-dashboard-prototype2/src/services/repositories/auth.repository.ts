import type {
  RestaurantLoginRequest,
  RestaurantLoginResponse,
  RestaurantRegisterRequest,
} from "@/features/auth/types/auth.types";

export interface AuthRepository {
  loginRestaurant: (payload: RestaurantLoginRequest) => Promise<RestaurantLoginResponse>;
  registerRestaurant: (payload: RestaurantRegisterRequest) => Promise<RestaurantLoginResponse>;
}
