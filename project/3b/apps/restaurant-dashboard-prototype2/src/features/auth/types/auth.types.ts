import type { Role } from "@/shared/constants/roles";
import type { ID } from "@/shared/types/common.types";

export type RestaurantLoginRequest = {
  email: string;
  password: string;
};

export type RestaurantRegisterRequest = RestaurantLoginRequest & {
  name: string;
  restaurantId: ID;
};

export type RestaurantLoginResponse = {
  accessToken: string;
  role: Role;
  restaurantId: ID;
  userId: ID;
};

export type AuthSession = RestaurantLoginResponse & {
  isAuthenticated: boolean;
};
