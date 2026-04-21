import type { RestaurantOrderSummary, UpdateOrderStatusInput } from "@/features/orders/types/orders.types";

export interface OrdersRepository {
  getRestaurantOrders: () => Promise<RestaurantOrderSummary[]>;
  updateOrderStatus: (payload: UpdateOrderStatusInput) => Promise<void>;
}
