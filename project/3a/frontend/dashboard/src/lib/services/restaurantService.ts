import { restaurantsMock } from "@/lib/mocks/restaurants.mock";
import type { Restaurant } from "@/lib/types";

// TODO: Reemplazar getAll() por llamada real cuando el backend exponga endpoint de listado.
// Ejemplo futuro: GET /restaurant

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const restaurantService = {
  async getAll(): Promise<Restaurant[]> {
    await delay(200);
    return [...restaurantsMock];
  },
};

