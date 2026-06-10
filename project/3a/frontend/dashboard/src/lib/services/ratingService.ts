import { getSession } from '@/lib/auth';

// --- Definición de Interfaces basadas en tus JSON ---

export interface RatingSummary {
  entityId: number;
  averageScore: number;
  totalRatings: number;
}

export interface IndividualRating {
  id: number;
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  orderId: number;
  score: number;      // Calificación (1-5)
  review: string;     // Comentario del cliente
  createdAt: string;  // Formato ISO
}
export interface Restaurant {
  id: number;
  name: string;
  description: string;
  phone: string;
  email: string;
  imageUrl: string;
  placeType: string;
  locationId: number;
}
// --- Configuración del Servicio ---

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const BASE_PATH = `${API_BASE}/rating`;

/**
 * Función auxiliar para obtener los headers con el token de sesión
 */
function authHeaders(): Record<string, string> {
  const session = getSession();
  return {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
  };
}

export const ratingService = {
  /**
   * Obtiene el resumen estadístico del restaurante (promedio y total)
   * GET /api/ratings/restaurant/{restaurantId}/summary
   */
  async getRestaurantDetail(id: number | string): Promise<Restaurant> {
    const res = await fetch(`${API_BASE}/restaurant/${id}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Restaurante no encontrado');
    return await res.json();
  },
  async getSummary(restaurantId: number | string): Promise<RatingSummary> {
    try {
      const res = await fetch(`${BASE_PATH}/restaurant/${restaurantId}/summary`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Error en el summary: ${res.status}`);
      }

      const data = await res.json();
      return data as RatingSummary;
    } catch (error) {
      console.error('RatingService.getSummary error:', error);
      // Retornamos un objeto por defecto para evitar que la UI rompa
      return {
        entityId: Number(restaurantId),
        averageScore: 0,
        totalRatings: 0
      };
    }
  },

  /**
   * Obtiene la lista detallada de reseñas individuales para el feed
   * GET /api/ratings/restaurant/{restaurantId}
   */
  async getRestaurantRatings(restaurantId: number | string): Promise<IndividualRating[]> {
    try {
      const res = await fetch(`${BASE_PATH}/restaurant/${restaurantId}`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Error en los ratings: ${res.status}`);
      }

      const data = await res.json();
      return data as IndividualRating[];
    } catch (error) {
      console.error('RatingService.getRestaurantRatings error:', error);
      return [];
    }
  },

  /**
   * Elimina una reseña específica por ID
   * DELETE /api/ratings/{id}
   */
  async deleteRating(ratingId: number | string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_PATH}/${ratingId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return res.ok;
    } catch (error) {
      console.error('RatingService.deleteRating error:', error);
      return false;
    }
  },

  /**
   * Obtiene las reseñas de un mesero específico (para la vista de staff)
   * GET /api/ratings/waiter/{waiterId}
   */
  async getWaiterRatings(waiterId: number | string): Promise<IndividualRating[]> {
    try {
      const res = await fetch(`${BASE_PATH}/waiter/${waiterId}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      return [];
    }
  }
};