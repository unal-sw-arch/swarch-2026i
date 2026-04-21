import type { ID } from "@/shared/types/common.types";

export const QUERY_KEYS = {
  authSession: ["authSession"] as const,
  restaurantOrders: ["restaurantOrders"] as const,
  orderDetail: (orderId: ID | string) => ["orderDetail", orderId] as const,
  kitchenOrders: ["kitchenOrders"] as const,
  restaurantMenu: (restaurantId: ID | string) => ["restaurantMenu", restaurantId] as const,
} as const;
