import { ORDER_STATUS } from "@/shared/constants/order-status";
import type { RestaurantOrderSummary, UpdateOrderStatusInput } from "@/features/orders/types/orders.types";
import { adaptOrdersResponse } from "@/services/adapters/orders.adapter";
import { httpClient } from "@/services/api/http-client";
import type { OrdersRepository } from "@/services/repositories/orders.repository";

function canUseKitchenStatusEndpoint(status: UpdateOrderStatusInput["status"]): boolean {
  return status === ORDER_STATUS.CREATED || status === ORDER_STATUS.IN_PREPARATION || status === ORDER_STATUS.READY;
}

export const apiOrdersRepository: OrdersRepository = {
  async getRestaurantOrders(): Promise<RestaurantOrderSummary[]> {
    const response = await httpClient.get<unknown>("/restaurants/me/orders");
    return adaptOrdersResponse(response.data);
  },

  async updateOrderStatus({ orderId, status }: UpdateOrderStatusInput): Promise<void> {
    // Validate order existence against the public contract before attempting updates.
    await httpClient.get<unknown>(`/orders/${orderId}`);

    if (!canUseKitchenStatusEndpoint(status)) {
      throw new Error("El backend actual solo permite cambios de estado de cocina (created, in_preparation, ready).");
    }

    await httpClient.patch(`/kitchen/orders/${orderId}/status`, {
      status,
    });
  },
};
