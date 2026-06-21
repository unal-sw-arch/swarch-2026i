import type { Reservation, ReservationStatus } from "@/lib/types";

// Default to a same-origin relative base so requests flow through the Vite dev
// proxy (which terminates the gateway's self-signed TLS). Override in prod with
// VITE_API_GATEWAY_BASE = https://<gateway>.
const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? "";

type CreateReservationData = {
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  notes?: string;
};

export type SuggestedTimeSlot = {
  time: string;
  availableTables: number;
};

export type SuggestedTimesResponse = {
  restaurantId: number;
  date: string;
  partySize: number;
  availableSlots: SuggestedTimeSlot[];
};

const authHeaders = (extra: Record<string, string> = {}) => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const normalizeReservation = (item: any): Reservation => ({
  id: Number(item.id),
  customerId: Number(item.customerId),
  customerName: item.customerName ?? "Cliente",
  restaurantId: Number(item.restaurantId),
  restaurantName: item.restaurantName ?? `Restaurante ${item.restaurantId ?? ""}`.trim(),
  reservationDate: item.reservationDate,
  reservationTime: String(item.reservationTime ?? "").slice(0, 5),
  partySize: Number(item.partySize ?? 1),
  status: item.status as ReservationStatus,
  notes: item.notes ?? null,
  orderId: item.orderId ?? null,
  tableId: item.tableId ?? null,
  checkedInAt: item.checkedInAt ?? null,
  createdAt: item.createdAt ?? null,
});

export const reservationService = {
  async getByRestaurant(restaurantId: number): Promise<Reservation[]> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation/restaurant/${restaurantId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeReservation) : [];
  },

  async getByCustomer(customerId: number): Promise<Reservation[]> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation/customer/${customerId}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeReservation) : [];
  },

  async create(data: CreateReservationData): Promise<Reservation> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Error creating reservation");
    return normalizeReservation(JSON.parse(text));
  },

  async getSuggestedTimes(
    restaurantId: number | string,
    date: string,
    partySize: number
  ): Promise<SuggestedTimesResponse> {
    const params = new URLSearchParams({
      date,
      partySize: String(partySize),
    });
    const response = await fetch(
      `${API_GATEWAY_BASE}/reservation/restaurant/${restaurantId}/suggested-times?${params}`,
      {
        headers: authHeaders(),
      }
    );
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Error loading suggested times");
    const data = JSON.parse(text);
    return {
      restaurantId: Number(data.restaurantId),
      date: data.date,
      partySize: Number(data.partySize),
      availableSlots: Array.isArray(data.availableSlots)
        ? data.availableSlots.map((slot: any) => ({
            time: String(slot.time ?? "").slice(0, 5),
            availableTables: Number(slot.availableTables ?? 0),
          }))
        : [],
    };
  },

  async assignTable(reservationId: number, tableId: number): Promise<Reservation> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation/${reservationId}/assign-table?tableId=${tableId}`, {
      method: "PUT",
      headers: authHeaders(),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Error assigning table");
    return normalizeReservation(JSON.parse(text));
  },

  async linkOrder(reservationId: number, orderId: number): Promise<Reservation> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation/${reservationId}/link-order`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ orderId }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Error linking order to reservation");
    return normalizeReservation(JSON.parse(text));
  },

  async updateStatus(reservationId: number, status: ReservationStatus): Promise<Reservation> {
    const response = await fetch(`${API_GATEWAY_BASE}/reservation/${reservationId}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Error updating reservation status");
    return normalizeReservation(JSON.parse(text));
  },
};
