import type { Table, TableApiResponse } from "@/lib/types";

const API_GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_BASE ?? "http://localhost:8080";

export const tableService = {
  async getByRestaurantId(restaurantId: number | string): Promise<Table[]> {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(`${API_GATEWAY_BASE}/restaurant/${restaurantId}/tables`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = (await response.json()) as TableApiResponse[];
      
      // Mapeamos y forzamos el tipo del status con 'as Table["status"]'
      return data.map(item => ({
        id: item.id,
        restaurantId: item.restaurantId,
        tableNumber: item.tableNumber,
        seats: item.seats,
        status: item.status as Table["status"], // Esto quita el error de la imagen
      }));
    } catch (error) {
      console.error("🚨 [TableService] Error:", error);
      return [];
    }
  },

  async updateStatus(tableId: number, status: string): Promise<Table | null> {
    const token = localStorage.getItem("auth_token");

    try {
      const response = await fetch(
        `${API_GATEWAY_BASE}/restaurant/tables/${tableId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const item = (await response.json()) as TableApiResponse;
      
      return {
        ...item,
        status: item.status as Table["status"], // Forzamos el tipo aquí también
      };
    } catch (error) {
      console.error("🚨 [TableService] Error updating status:", error);
      return null;
    }
  },
    async create(restaurantId: number | string, tableData: { tableNumber: string; seats: number }): Promise<Table | null> {
    const token = localStorage.getItem("auth_token");
    try {
        const response = await fetch(`${API_GATEWAY_BASE}/restaurant/${restaurantId}/tables`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(tableData),
        });

        if (!response.ok) throw new Error("Error al crear la mesa");
        const item = (await response.json()) as TableApiResponse;
        
        return {
        ...item,
        status: item.status as Table["status"],
        };
    } catch (error) {
        console.error("🚨 [TableService] Error creating table:", error);
        return null;
    }
  },
  async delete(tableId: number): Promise<boolean> {
    const token = localStorage.getItem("auth_token");
    try {
        const response = await fetch(`${API_GATEWAY_BASE}/restaurant/tables/${tableId}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        });

        if (!response.ok) throw new Error("Error al eliminar la mesa");
        return true;
    } catch (error) {
        console.error("🚨 [TableService] Error deleting table:", error);
        return false;
    }
  },
  // Nota: Si el backend devuelve un error 400 con un mensaje específico, 
  // podríamos capturarlo y mostrarlo en la UI para una mejor experiencia de usuario.
  // Esto se puede hacer leyendo el cuerpo de la respuesta en caso de error y extrayendo el mensaje.
  // Sin embargo, esto depende de cómo el backend maneje los errores y qué información incluya en la respuesta
  // Los métodos create y delete no suelen dar este error porque devuelven 
  // el objeto completo o un boolean, pero aplica la misma lógica si es necesario.
};