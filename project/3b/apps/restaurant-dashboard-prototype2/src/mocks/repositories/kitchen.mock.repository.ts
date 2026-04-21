import type { KitchenRepository } from "@/services/repositories/kitchen.repository";
import { KITCHEN_MOCK } from "@/mocks/data/kitchen.mock";
import type { KitchenOrder, KitchenOrderStatus, UpdateKitchenOrderStatusResponse } from "@/features/kitchen/types/kitchen.types";
import { syncOrderStatus } from "@/mocks/repositories/orders.mock.repository";
import { ORDER_STATUS } from "@/shared/constants/order-status";

const kitchenStore: KitchenOrder[] = KITCHEN_MOCK.map((order) => ({ ...order }));

function delay(ms = 350) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

// Transiciones válidas de estado
const VALID_TRANSITIONS: Record<KitchenOrderStatus, KitchenOrderStatus[]> = {
  [ORDER_STATUS.CREATED]: [ORDER_STATUS.IN_PREPARATION],
  [ORDER_STATUS.IN_PREPARATION]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]: [],
};

function isValidTransition(currentStatus: KitchenOrderStatus, nextStatus: KitchenOrderStatus): boolean {
  return VALID_TRANSITIONS[currentStatus].includes(nextStatus);
}

function getStatusLabel(status: KitchenOrderStatus): string {
  const labels: Record<KitchenOrderStatus, string> = {
    [ORDER_STATUS.CREATED]: "Creado",
    [ORDER_STATUS.IN_PREPARATION]: "En preparación",
    [ORDER_STATUS.READY]: "Listo",
  };
  return labels[status];
}

export const kitchenMockRepository: KitchenRepository = {
  async getKitchenOrders() {
    await delay();
    return kitchenStore.map((order) => ({ ...order }));
  },

  async updateKitchenOrderStatus({ orderId, status }): Promise<UpdateKitchenOrderStatusResponse> {
    await delay();

    const order = kitchenStore.find((entry) => entry.orderId === orderId);

    if (!order) {
      throw new Error(`Pedido ${orderId} no encontrado en cocina.`);
    }

    if (!isValidTransition(order.status, status)) {
      const currentLabel = getStatusLabel(order.status);
      const nextLabel = getStatusLabel(status);
      throw new Error(`No se puede cambiar de ${currentLabel} a ${nextLabel}.`);
    }

    order.status = status;
    syncOrderStatus(orderId, status);

    return {
      orderId,
      status,
      message: `Pedido actualizado a ${getStatusLabel(status)}.`,
    };
  },
};
