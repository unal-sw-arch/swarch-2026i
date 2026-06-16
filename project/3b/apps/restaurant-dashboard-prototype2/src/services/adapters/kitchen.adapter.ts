import type { KitchenOrder, UpdateKitchenOrderStatusResponse } from "@/features/kitchen/types/kitchen.types";
import { ORDER_STATUS } from "@/shared/constants/order-status";
import type { ID, ISODateString } from "@/shared/types/common.types";

type ApiKitchenOrder = {
  id?: unknown;
  orderId?: unknown;
  order_id?: unknown;
  restaurantId?: unknown;
  restaurant_id?: unknown;
  status?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
};

type ApiKitchenList = {
  items?: unknown;
  data?: {
    items?: unknown;
  };
};

type ApiKitchenStatusUpdate = {
  orderId?: unknown;
  order_id?: unknown;
  status?: unknown;
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

  throw new Error(`Invalid ${fieldName} in kitchen response.`);
}

function toCreatedAt(value: unknown): ISODateString {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Invalid createdAt in kitchen response.");
  }

  return value;
}

function toKitchenStatus(value: unknown): KitchenOrder["status"] {
  if (typeof value !== "string") {
    throw new Error("Invalid status in kitchen response.");
  }

  const normalized = value.toLowerCase();

  switch (normalized) {
    case ORDER_STATUS.CREATED:
    case ORDER_STATUS.IN_PREPARATION:
    case ORDER_STATUS.READY:
    case ORDER_STATUS.DELIVERED:
      return normalized;
    default:
      throw new Error("Unsupported kitchen status in response.");
  }
}

function extractKitchenItems(payload: unknown): unknown[] {
  if (payload === null || payload === undefined) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  assertObject(payload, "kitchen orders");

  const source = payload as ApiKitchenList;

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (source.data === null || source.items === null || payload === null) {
    return [];
  }

  if (Array.isArray(source.data)) {
    return source.data;
  }

  if (source.data && Array.isArray((source.data as any).items)) {
    return (source.data as any).items;
  }

  throw new Error("Kitchen response does not contain a valid items list.");
}

export function adaptKitchenOrdersResponse(payload: unknown): KitchenOrder[] {
  const items = extractKitchenItems(payload);

  return items.map((item) => {
    assertObject(item, "kitchen order");
    const source = item as ApiKitchenOrder;

    return {
      orderId: toNumber(source.id ?? source.orderId ?? source.order_id, "orderId"),
      restaurantId: toNumber(source.restaurantId ?? source.restaurant_id, "restaurantId"),
      status: toKitchenStatus(source.status),
      createdAt: toCreatedAt(source.createdAt ?? source.created_at),
    };
  });
}

export function adaptKitchenStatusUpdateResponse(payload: unknown): UpdateKitchenOrderStatusResponse {
  assertObject(payload, "kitchen status update");

  const source = payload as ApiKitchenStatusUpdate & { id?: unknown };
  const message = typeof source.message === "string" ? source.message : undefined;

  return {
    orderId: toNumber(source.id ?? source.orderId ?? source.order_id, "orderId"),
    status: toKitchenStatus(source.status),
    message,
  };
}
