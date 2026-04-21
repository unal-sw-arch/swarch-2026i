import type { RestaurantOrderSummary } from "@/features/orders/types/orders.types";
import { ORDER_STATUS, type OrderStatus } from "@/shared/constants/order-status";
import type { ID, ISODateString } from "@/shared/types/common.types";

type ApiOrder = {
  id?: unknown;
  customerId?: unknown;
  customer_id?: unknown;
  restaurantId?: unknown;
  restaurant_id?: unknown;
  status?: unknown;
  totalAmount?: unknown;
  total_amount?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
};

type ApiOrdersCollection = {
  items?: unknown;
  data?: {
    items?: unknown;
  };
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

  throw new Error(`Invalid ${fieldName} in orders response.`);
}

function toStatus(value: unknown): OrderStatus {
  if (typeof value !== "string") {
    throw new Error("Invalid order status in orders response.");
  }

  const normalized = value.toLowerCase();

  switch (normalized) {
    case ORDER_STATUS.CREATED:
    case ORDER_STATUS.IN_PREPARATION:
    case ORDER_STATUS.READY:
    case ORDER_STATUS.DELIVERED:
    case ORDER_STATUS.CANCELLED:
      return normalized;
    default:
      throw new Error("Unsupported order status in orders response.");
  }
}

function toIsoDate(value: unknown): ISODateString {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Invalid createdAt in orders response.");
  }

  return value;
}

function adaptOrder(order: unknown): RestaurantOrderSummary {
  assertObject(order, "order");

  const source = order as ApiOrder;
  const customerId = source.customerId ?? source.customer_id;
  const restaurantId = source.restaurantId ?? source.restaurant_id;
  const totalAmount = source.totalAmount ?? source.total_amount;
  const createdAt = source.createdAt ?? source.created_at;

  return {
    id: toNumber(source.id, "id"),
    customerId: toNumber(customerId, "customerId"),
    restaurantId: toNumber(restaurantId, "restaurantId"),
    status: toStatus(source.status),
    totalAmount: toNumber(totalAmount, "totalAmount"),
    createdAt: toIsoDate(createdAt),
  };
}

function extractOrderItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  assertObject(payload, "orders");

  const source = payload as ApiOrdersCollection;

  if (Array.isArray(source.items)) {
    return source.items;
  }

  if (source.data && Array.isArray(source.data.items)) {
    return source.data.items;
  }

  throw new Error("Orders response does not contain a valid items list.");
}

export function adaptOrdersResponse(payload: unknown): RestaurantOrderSummary[] {
  const items = extractOrderItems(payload);
  return items.map((item) => adaptOrder(item));
}
