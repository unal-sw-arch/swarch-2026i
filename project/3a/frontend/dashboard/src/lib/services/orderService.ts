import type { Order, OrderStatus } from "@/lib/types";

// Default to a same-origin relative base so requests flow through the Vite dev
// proxy (which terminates the gateway's self-signed TLS). Override in prod with
// VITE_API_GATEWAY_BASE = https://<gateway>.
const API = import.meta.env.VITE_API_GATEWAY_BASE ?? "";

// 🔐 Headers con auth
const getHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface PlaceOrderItem {
  menuItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderData {
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  channel: string;
  tableId?: number | null;
  tableNumber?: number;
  notes?: string;
  items: PlaceOrderItem[];
}


// 🎯 Estados activos
const ACTIVE_STATUS: OrderStatus[] = [
  "PENDING",
  "IN_PREPARATION",
  "READY",
];

const normalizeOrder = (raw: any): Order => ({
  id: Number(raw.id),
  customerId: raw.customerId ?? null,
  customerName: raw.customerName ?? "Cliente",
  restaurantId: Number(raw.restaurantId),
  restaurantName: raw.restaurantName ?? `Restaurante ${raw.restaurantId ?? ""}`.trim(),
  status: raw.status,
  notes: raw.notes ?? null,
  eta: raw.eta,
  total: Number(raw.totalAmount ?? raw.total ?? 0),
  totalAmount: Number(raw.totalAmount ?? raw.total ?? 0),
  priority: Number(raw.priority ?? 0),
  tableNumber: Number(raw.tableNumber ?? 0),
  tableId: raw.tableId ?? raw.tableNumber ?? null,
  waiterId: raw.waiterId ?? null,
  tipAmount: raw.tipAmount ?? null,
  waiterComment: raw.waiterComment ?? null,
  preparationMinutes: raw.preparationMinutes,
  requestedArrivalTime: raw.requestedArrivalTime ?? null,
  arrivalMessage: raw.arrivalMessage ?? null,
  cancellationReason: raw.cancellationReason ?? null,
  cancelledAt: raw.cancelledAt ?? null,
  items: Array.isArray(raw.items)
    ? raw.items.map((item: any) => ({
        id: Number(item.id),
        menuItemId: String(item.menuItemId ?? item.id),
        productName: item.productName ?? item.itemName ?? "Item",
        quantity: Number(item.quantity ?? 1),
        unitPrice: Number(item.unitPrice ?? 0),
        subtotal: Number(item.subtotal ?? 0),
      }))
    : [],
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const normalizeArray = (json: any): Order[] => {
  if (Array.isArray(json)) return json.map(normalizeOrder);
  if (Array.isArray(json?.content)) return json.content.map(normalizeOrder);
  if (Array.isArray(json?.data)) return json.data.map(normalizeOrder);

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
    case "PENDING":
      return "IN_PREPARATION";
    case "IN_PREPARATION":
      return "READY";
    case "READY":
      return "DELIVERED";
    default:
      return null;
  }
};

// 🍽️ Validar mesa libre
export const isTableFree = (tableId: number, orders: Order[]) => {
  return !orders.some(
    (o) =>
      (o.tableId === tableId || o.tableNumber === tableId) &&
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
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error actualizando estado");
    }
  },

  async updatePriority(orderId: number, priority: number): Promise<Order> {
    const res = await fetch(`${API}/order/${orderId}/priority`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ priority }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error actualizando prioridad");
    }

    const json = await res.json();
    return normalizeOrder(json.data ?? json);
  },

  async cancelOrder(orderId: number, reason: string): Promise<Order> {
    const res = await fetch(`${API}/order/${orderId}/cancel`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error cancelando orden");
    }

    const json = await res.json();
    return normalizeOrder(json.data ?? json);
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
    return normalizeOrder(json.data ?? json);
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
      (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
    );
  },

  async getMonthlyEarnings(restaurantId: number, year: number, month: number) {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    const res = await fetch(`${API}/order/restaurant/${restaurantId}/earnings/monthly?${params}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Error cargando ingresos");
    }
    const json = await res.json();
    return json.data ?? json;
  },

  // 🍽️ Plato más entregado del restaurante (backend devuelve el nombre)
  async getTopDish(restaurantId: number): Promise<string | null> {
    const res = await fetch(`${API}/order/restaurant/${restaurantId}/top-dish`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  },

  // 🧪 Debug
  logOrder(order: Order) {
    console.log("📦 ORDER:", order);
  },

  // 🛒 Crear pedido desde el dashboard (mapea al contrato real del backend)
  async placeOrder(data: PlaceOrderData): Promise<{ id: number }> {
    // El backend espera una entrada por unidad: { itemName, notes }.
    // Expandimos cada item del carrito según su cantidad.
    const items = data.items.flatMap((item) =>
      Array.from({ length: Math.max(1, item.quantity) }, () => ({
        itemName: item.productName,
        notes: data.notes?.trim() || null,
      }))
    );

    const payload = {
      restaurantId: data.restaurantId,
      tableNumber: data.tableNumber ?? 0,
      tableId: data.tableId ?? null,
      customerId: data.customerId,
      customerName: data.customerName,
      totalAmount: data.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
      notes: data.notes?.trim() || null,
      items,
    };

    const res = await fetch(`${API}/order`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
    }

    const json = await res.json();
    // El backend devuelve ApiResponse<OrderResponse> => { message, data: { id, ... } }
    const id = json?.data?.id ?? json?.id;
    return { id };
  },
};
