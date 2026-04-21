export const ORDER_STATUS = {
  CREATED: "created",
  IN_PREPARATION: "in_preparation",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
