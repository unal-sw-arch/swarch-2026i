import type { OrdersRepository } from "@/services/repositories/orders.repository";
import { ORDERS_MOCK } from "@/mocks/data/orders.mock";
import type { RestaurantOrderSummary } from "@/features/orders/types/orders.types";
import type { OrderStatus } from "@/shared/constants/order-status";

export const ordersStore: RestaurantOrderSummary[] = ORDERS_MOCK.map((order) => ({ ...order }));

export function syncOrderStatus(orderId: RestaurantOrderSummary["id"], status: OrderStatus) {
  const order = ordersStore.find((entry) => entry.id === orderId);

  if (!order) {
    return;
  }

  order.status = status;
}

function delay(ms = 350) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export const ordersMockRepository: OrdersRepository = {
  async getRestaurantOrders() {
    await delay();

    return ordersStore.map((order) => ({ ...order }));
  },
  async updateOrderStatus({ orderId, status }) {
    await delay();

    const order = ordersStore.find((entry) => entry.id === orderId);

    if (!order) {
      throw new Error("No se encontró el pedido solicitado.");
    }

    syncOrderStatus(orderId, status as OrderStatus);
  },
};
