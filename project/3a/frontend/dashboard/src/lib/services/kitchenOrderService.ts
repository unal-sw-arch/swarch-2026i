import type { KitchenOrder } from '@/lib/types';
import { getSession } from '@/lib/auth';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080';
const ORDER_PREFIX = `${GATEWAY_URL}/order`;

interface ApiResponse<T> {
  message: string;
  data: T | null;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const session = getSession();
  const base: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (session?.token) {
    base['Authorization'] = `Bearer ${session.token}`;
  }
  return base;
}

async function parse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  if (!text) return { message: res.statusText, data: null };
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return { message: text, data: null };
  }
}

export const kitchenOrderService = {
  async getKitchenOrders(restaurantId: number): Promise<KitchenOrder[]> {
    const res = await fetch(`${ORDER_PREFIX}/kitchen/${restaurantId}`, {
      headers: authHeaders(),
    });
    const json = await parse<KitchenOrder[]>(res);
    if (!res.ok) throw new Error(json.message || 'Error loading kitchen orders');
    return json.data ?? [];
  },

  async updateOrderStatus(orderId: number, status: string): Promise<KitchenOrder | null> {
    const res = await fetch(`${ORDER_PREFIX}/${orderId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await parse<KitchenOrder>(res);
    if (!res.ok || !json.data) {
      throw new Error(json.message || 'Error updating order status');
    }
    return json.data;
  },

  async getOrder(orderId: number): Promise<KitchenOrder | null> {
    const res = await fetch(`${ORDER_PREFIX}/${orderId}`, {
      headers: authHeaders(),
    });
    const json = await parse<KitchenOrder>(res);
    return json.data ?? null;
  },
};
