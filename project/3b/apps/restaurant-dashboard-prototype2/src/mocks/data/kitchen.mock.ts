import type { KitchenOrder } from "@/features/kitchen/types/kitchen.types";
import { ORDER_STATUS } from "@/shared/constants/order-status";

export const KITCHEN_MOCK: KitchenOrder[] = [
  {
    orderId: 1002,
    restaurantId: 1,
    status: ORDER_STATUS.IN_PREPARATION,
    createdAt: "2026-04-13T10:42:00.000Z",
  },
  {
    orderId: 1003,
    restaurantId: 1,
    status: ORDER_STATUS.CREATED,
    createdAt: "2026-04-13T10:45:00.000Z",
  },
  {
    orderId: 1005,
    restaurantId: 1,
    status: ORDER_STATUS.READY,
    createdAt: "2026-04-13T10:57:00.000Z",
  },
];
