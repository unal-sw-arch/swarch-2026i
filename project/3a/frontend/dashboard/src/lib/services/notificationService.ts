const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? import.meta.env.VITE_API_URL ?? "";

export const NOTIFICATIONS_SEEN_EVENT = "clickmunch:notifications-seen";

export interface RestaurantNotification {
  id: number;
  userId: number;
  restaurantId: number | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  orderId: number | null;
  createdAt: string;
}

const authHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const seenKey = (restaurantId: number | string) => `notifications_seen_at:${restaurantId}`;

const normalizeNotification = (item: any): RestaurantNotification => ({
  id: Number(item.id),
  userId: Number(item.userId),
  restaurantId: item.restaurantId == null ? null : Number(item.restaurantId),
  type: item.type ?? "GENERAL",
  title: item.title ?? "Notificación",
  message: item.message ?? "",
  read: Boolean(item.read),
  orderId: item.orderId == null ? null : Number(item.orderId),
  createdAt: item.createdAt ?? new Date().toISOString(),
});

export const notificationService = {
  async getByRestaurant(restaurantId: number | string): Promise<RestaurantNotification[]> {
    const response = await fetch(`${API_GATEWAY_BASE}/notification/restaurant/${restaurantId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeNotification) : [];
  },

  getSeenAt(restaurantId: number | string): number {
    return Number(localStorage.getItem(seenKey(restaurantId)) ?? 0);
  },

  markRestaurantSeen(restaurantId: number | string, seenAt = Date.now()) {
    localStorage.setItem(seenKey(restaurantId), String(seenAt));
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_SEEN_EVENT, {
      detail: { restaurantId: String(restaurantId), seenAt },
    }));
  },

  hasUnseen(restaurantId: number | string, notifications: RestaurantNotification[]) {
    const seenAt = this.getSeenAt(restaurantId);
    return notifications.some((notification) => new Date(notification.createdAt).getTime() > seenAt);
  },
};
