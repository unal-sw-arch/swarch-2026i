import { ROLES } from "@/shared/constants/roles";
import type { RestaurantLoginRequest, RestaurantLoginResponse } from "@/features/auth/types/auth.types";

export const AUTH_MOCK_CREDENTIALS: RestaurantLoginRequest = {
  email: "rest@test.com",
  password: "123456",
};

export const AUTH_MOCK_RESPONSE: RestaurantLoginResponse = {
  accessToken: "mock-token-restaurant",
  role: ROLES.RESTAURANT,
  restaurantId: 1,
  userId: 1,
};

export const AUTH_MOCK = AUTH_MOCK_RESPONSE;

export const AUTH_MOCK_DELAY_MS = 350;
