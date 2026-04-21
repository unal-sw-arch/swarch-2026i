import type { KitchenOrder, UpdateKitchenOrderStatusRequest, UpdateKitchenOrderStatusResponse } from "@/features/kitchen/types/kitchen.types";

export interface KitchenRepository {
  getKitchenOrders: () => Promise<KitchenOrder[]>;
  updateKitchenOrderStatus: (payload: UpdateKitchenOrderStatusRequest) => Promise<UpdateKitchenOrderStatusResponse>;
}
