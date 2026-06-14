import type { RestaurantLoginResponse } from "@/features/auth/types/auth.types";
import { ROLES } from "@/shared/constants/roles";
import type { ID } from "@/shared/types/common.types";

type ApiLoginResponse = {
  accessToken?: unknown;
  token?: unknown;
  role?: unknown;
  restaurantId?: unknown;
  restaurant_id?: unknown;
  userId?: unknown;
  user_id?: unknown;
};

function assertObject(value: unknown, context: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid ${context} response.`);
  }
}

function toNumber(value: unknown): ID {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error("Invalid numeric field in auth response.");
}

export function adaptLoginResponse(payload: unknown): RestaurantLoginResponse {
  assertObject(payload, "login");

  const source = payload as ApiLoginResponse;
  const accessToken = typeof source.accessToken === "string" ? source.accessToken : source.token;
  const role = typeof source.role === "string" ? source.role.toUpperCase() : source.role;
  const restaurantId = source.restaurantId ?? source.restaurant_id;
  const userId = source.userId ?? source.user_id;

  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Login response did not include a valid access token.");
  }

  if (role !== ROLES.RESTAURANT) {
    throw new Error("Login response contains an unsupported role.");
  }

  return {
    accessToken,
    role,
    restaurantId: toNumber(restaurantId),
    userId: toNumber(userId),
  };
}
