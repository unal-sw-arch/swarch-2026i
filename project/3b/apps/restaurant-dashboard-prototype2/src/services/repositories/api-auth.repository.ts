import type { RestaurantLoginRequest, RestaurantRegisterRequest } from "@/features/auth/types/auth.types";
import { adaptLoginResponse } from "@/services/adapters/auth.adapter";
import { httpClient } from "@/services/api/http-client";
import type { AuthRepository } from "@/services/repositories/auth.repository";

export const apiAuthRepository: AuthRepository = {
  async loginRestaurant(payload: RestaurantLoginRequest) {
    const response = await httpClient.post<unknown>("/auth/login/restaurant", payload);
    return adaptLoginResponse(response.data);
  },
  async registerRestaurant(payload: RestaurantRegisterRequest) {
    await httpClient.post("/auth/register/restaurant", payload);
    const response = await httpClient.post<unknown>("/auth/login/restaurant", {
      email: payload.email,
      password: payload.password,
    });

    return adaptLoginResponse(response.data);
  },
};
