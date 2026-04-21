import "server-only";

import { GatewayClient } from "@/lib/gateway-client";
import { getAccessToken } from "@/lib/session";
import type { OrderDetail, OrdersResponse, TimelineResponse } from "@/lib/types";

const gatewayClient = new GatewayClient();

export const OrdersRepository = {
  async getMyOrders() {
    const token = await getAccessToken();
    if (!token) {
      return { items: [] } as OrdersResponse;
    }

    try {
      return await gatewayClient.get<OrdersResponse>("/customers/me/orders", token);
    } catch {
      return { items: [] };
    }
  },

  async getOrder(orderId: number) {
    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    try {
      return await gatewayClient.get<OrderDetail>(`/orders/${orderId}`, token);
    } catch {
      return null;
    }
  },

  async getTimeline(orderId: number) {
    const token = await getAccessToken();
    if (!token) {
      return { orderId, events: [] } as TimelineResponse;
    }

    try {
      return await gatewayClient.get<TimelineResponse>(
        `/orders/${orderId}/timeline`,
        token,
      );
    } catch {
      return { orderId, events: [] };
    }
  },
};
