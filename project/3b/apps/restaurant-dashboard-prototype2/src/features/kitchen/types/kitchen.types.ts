import { ORDER_STATUS } from "@/shared/constants/order-status";
import type { ID, ISODateString } from "@/shared/types/common.types";

export type KitchenOrderStatus =
  | typeof ORDER_STATUS.CREATED
  | typeof ORDER_STATUS.IN_PREPARATION
  | typeof ORDER_STATUS.READY
  | typeof ORDER_STATUS.DELIVERED;

export type KitchenOrder = {
  orderId: ID;
  restaurantId: ID;
  status: KitchenOrderStatus;
  createdAt: ISODateString;
};

export type KitchenOrderItem = KitchenOrder;

export type UpdateKitchenOrderStatusRequest = {
  orderId: ID;
  status: KitchenOrderStatus;
};

export type UpdateKitchenOrderStatusResponse = {
  orderId: ID;
  status: KitchenOrderStatus;
  message?: string;
};
