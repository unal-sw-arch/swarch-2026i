import type { KitchenOrder, UpdateKitchenOrderStatusRequest, UpdateKitchenOrderStatusResponse } from "@/features/kitchen/types/kitchen.types";
import { adaptKitchenOrdersResponse, adaptKitchenStatusUpdateResponse } from "@/services/adapters/kitchen.adapter";
import { httpClient } from "@/services/api/http-client";
import type { KitchenRepository } from "@/services/repositories/kitchen.repository";

export const apiKitchenRepository: KitchenRepository = {
  async getKitchenOrders(): Promise<KitchenOrder[]> {
    const response = await httpClient.get<unknown>("/kitchen/orders");
    return adaptKitchenOrdersResponse(response.data);
  },

  async updateKitchenOrderStatus({ orderId, status }: UpdateKitchenOrderStatusRequest): Promise<UpdateKitchenOrderStatusResponse> {
    const response = await httpClient.patch<unknown>(`/kitchen/orders/${orderId}/status`, {
      status,
    });

    return adaptKitchenStatusUpdateResponse(response.data);
  },
};
