import type { MenuProduct, UpdateAvailabilityResponse } from "@/features/products/types/products.types";
import type { ID } from "@/shared/types/common.types";

type ApiMenuItem = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  price?: unknown;
  isAvailable?: unknown;
  is_available?: unknown;
  restaurantId?: unknown;
  restaurant_id?: unknown;
};

type ApiMenuCollection = {
  items?: unknown;
  data?: {
    items?: unknown;
  };
};

type ApiAvailabilityResponse = {
  id?: unknown;
  isAvailable?: unknown;
  is_available?: unknown;
  message?: unknown;
};

function assertObject(value: unknown, context: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid ${context} response.`);
  }
}

function toNumber(value: unknown, fieldName: string): ID {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(`Invalid ${fieldName} in catalog response.`);
}

function toBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${fieldName} in catalog response.`);
  }

  return value;
}

function extractMenuItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  assertObject(payload, "menu");

  const source = payload as ApiMenuCollection;

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (source.data && Array.isArray(source.data.items)) {
    return source.data.items;
  }

  throw new Error("Menu response does not contain a valid items list.");
}

export function adaptRestaurantMenuResponse(payload: unknown): MenuProduct[] {
  const items = extractMenuItems(payload);
  
  const root = payload as Record<string, unknown>;
  const fallbackRestaurantId = root?.restaurantId ?? root?.restaurant_id;

  return items.map((item) => {
    assertObject(item, "menu item");
    const source = item as ApiMenuItem;

    if (typeof source.name !== "string" || (source.description != null && typeof source.description !== "string")) {
      throw new Error("Menu response contains invalid text fields.");
    }

    return {
      id: toNumber(source.id, "id"),
      name: source.name,
      description: source.description || "",
      price: toNumber(source.price, "price"),
      isAvailable: toBoolean(source.isAvailable ?? source.is_available, "isAvailable"),
      restaurantId: toNumber(source.restaurantId ?? source.restaurant_id ?? fallbackRestaurantId, "restaurantId"),
    };
  });
}

export function adaptUpdateAvailabilityResponse(payload: unknown): UpdateAvailabilityResponse {
  assertObject(payload, "update availability");

  const source = payload as ApiAvailabilityResponse;
  const message = typeof source.message === "string" ? source.message : undefined;

  return {
    id: toNumber(source.id, "id"),
    isAvailable: toBoolean(source.isAvailable ?? source.is_available, "isAvailable"),
    message,
  };
}
