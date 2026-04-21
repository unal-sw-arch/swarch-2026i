import type { RestaurantOrderSummary } from "@/features/orders/types/orders.types";
import { ORDER_STATUS } from "@/shared/constants/order-status";

export const ORDERS_MOCK: RestaurantOrderSummary[] = [
  {
    id: 1001,
    customerId: 501,
    restaurantId: 1,
    status: ORDER_STATUS.CREATED,
    totalAmount: 24.5,
    createdAt: "2026-04-13T10:30:00.000Z",
  },
  {
    id: 1002,
    customerId: 502,
    restaurantId: 1,
    status: ORDER_STATUS.IN_PREPARATION,
    totalAmount: 42,
    createdAt: "2026-04-13T10:42:00.000Z",
  },
  {
    id: 1003,
    customerId: 503,
    restaurantId: 1,
    status: ORDER_STATUS.READY,
    totalAmount: 18.75,
    createdAt: "2026-04-13T10:48:00.000Z",
  },
  {
    id: 1004,
    customerId: 504,
    restaurantId: 1,
    status: ORDER_STATUS.DELIVERED,
    totalAmount: 30,
    createdAt: "2026-04-13T10:55:00.000Z",
  },
];
