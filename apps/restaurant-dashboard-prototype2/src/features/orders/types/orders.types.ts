import type { OrderStatus } from "@/shared/constants/order-status";
import type { ID, ISODateString } from "@/shared/types/common.types";

export type RestaurantOrderSummary = {
  id: ID;
  customerId: ID;
  restaurantId?: ID;
  status: OrderStatus;
  totalAmount: number;
  createdAt?: ISODateString;
};

export type OrderItemDetail = {
  menuItemId: ID;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type RestaurantOrderDetail = RestaurantOrderSummary & {
  items: OrderItemDetail[];
};

export type UpdateOrderStatusInput = {
  orderId: ID;
  status: OrderStatus;
};
