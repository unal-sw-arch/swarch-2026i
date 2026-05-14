import type { OperatingHours } from "../types";

const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? "http://localhost:8080";

// Función auxiliar para centralizar headers (Token + JSON)
const getHeaders = () => {
  const token = localStorage.getItem("auth_token"); // O de donde guardes tu JWT
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const hoursService = {
  // Obtener todos los horarios de un restaurante
  getByRestaurantId: async (restaurantId: number): Promise<OperatingHours[]> => {
    const response = await fetch(`${API_GATEWAY_BASE}/restaurant/${restaurantId}/hours`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error("Error al obtener horarios");
    return await response.json();
  },

  // Crear o actualizar un horario
  saveHours: async (restaurantId: number, data: OperatingHours) => {
  const isUpdate = !!data.id;
  const url = isUpdate 
    ? `${API_GATEWAY_BASE}/restaurant/hours/${data.id}`
    : `${API_GATEWAY_BASE}/restaurant/${restaurantId}/hours`;

  // Creamos el body con los nombres de campos que pide el backend
  const bodyPayload = {
    dayOfWeek: data.dayOfWeek,
    openTime: data.openTime, // Mapeo de openingTime -> openTime
    closeTime: data.closeTime  // Mapeo de closingTime -> closeTime
  };

  const response = await fetch(url, {
    method: isUpdate ? "PUT" : "POST",
    headers: getHeaders(),
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al guardar el horario");
  }

  return await response.json();
},

  // Eliminar un bloque de horario
  delete: async (hoursId: number) => {
    const response = await fetch(`${API_GATEWAY_BASE}/restaurant/hours/${hoursId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("No se pudo eliminar el horario");
  }
};