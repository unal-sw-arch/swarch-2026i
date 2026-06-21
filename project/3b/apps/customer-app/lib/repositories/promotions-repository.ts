import "server-only";

import { GatewayClient } from "@/lib/gateway-client";
import type { PromotionsResponse } from "@/lib/types";

const gatewayClient = new GatewayClient();

export const PromotionsRepository = {
  async getActivePromotions() {
    try {
      return await gatewayClient.get<PromotionsResponse>("/promotions/active");
    } catch {
      return { items: [] };
    }
  },
};
