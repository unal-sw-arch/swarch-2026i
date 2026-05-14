import type { Order, OrderStatus } from "@/lib/types";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// 🔐 Headers con auth
const getHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 🎯 Estados activos
const ACTIVE_STATUS: OrderStatus[] = [
  "Pending",
  "SentToKitchen",
  "Preparing",
  "Ready",
  "Served",
];

// 🧠 Normalizador (CLAVE DEL FIX)
const normalizeArray = (json: any): Order[] => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.content)) return json.content;
  if (Array.isArray(json?.data)) return json.data;

  console.warn("⚠️ Formato inesperado:", json);
  return [];
};

// ⏱️ Util: tiempo en minutos
export const getMinutes = (date: string) => {
  const created = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 60000);
};

// 🎨 Color por tiempo
export const getTimeColor = (min: number) => {
  if (min < 10) return "text-green-600";
  if (min < 20) return "text-yellow-500";
  return "text-red-600";
};

// 🔄 Flujo de estados
export const getNextStatus = (status: OrderStatus): OrderStatus | null => {
  switch (status) {
    case "Pending":
      return "SentToKitchen";
    case "SentToKitchen":
      return "Preparing";
    case "Preparing":
      return "Ready";
    case "Ready":
      return "Served";
    case "Served":
      return "Delivered";
    default:
      return null;
  }
};

// 🍽️ Validar mesa libre
export const isTableFree = (tableId: number, orders: Order[]) => {
  return !orders.some(
    (o) =>
      o.tableId === tableId &&
      ACTIVE_STATUS.includes(o.status)
  );
};

export const orderService = {

  // 📋 Obtener todas las órdenes
  async getByRestaurant(restaurantId: number): Promise<Order[]> {
    const res = await fetch(`${API}/order/restaurant/${restaurantId}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error cargando órdenes");
    }

    const json = await res.json();

    // 🔥 AQUÍ ESTABA EL BUG
    return normalizeArray(json);
  },

  // 🔥 Órdenes activas
  async getActive(restaurantId: number): Promise<Order[]> {
    const data = await this.getByRestaurant(restaurantId);
    return data.filter((o) => ACTIVE_STATUS.includes(o.status));
  },

  // 🔄 Actualizar estado
  async updateStatus(orderId: number, status: OrderStatus): Promise<void> {
    const res = await fetch(`${API}/order/${orderId}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error actualizando estado");
    }
  },

  // 🍽️ Asignar mesa
  async assignTable(orderId: number, tableId: number): Promise<void> {
    const res = await fetch(
      `${API}/order/${orderId}/assign-table?tableId=${tableId}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error asignando mesa");
    }
  },

  // 🔍 Obtener por ID
  async getById(orderId: number): Promise<Order | null> {
    const res = await fetch(`${API}/order/${orderId}`, {
      headers: getHeaders(),
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json;
  },

  // 📜 Historial
  async getHistory(restaurantId: number): Promise<Order[]> {
    const res = await fetch(`${API}/order/restaurant/${restaurantId}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error cargando historial");
    }

    const json = await res.json();
    const data = normalizeArray(json);

    return data.filter(
      (o) => o.status === "Delivered" || o.status === "Cancelled"
    );
  },

  // 🧪 Debug
  logOrder(order: Order) {
    console.log("📦 ORDER:", order);
  },
};