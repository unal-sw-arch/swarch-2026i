import { productsApi } from '@/core/api/productsApi';
import type { MenuCategory } from '../interface/menu';

export const getMenuByRestaurant = async (restaurantId: number): Promise<MenuCategory[]> => {
  try {
    const { data } = await productsApi.get<MenuCategory[]>(
      `/menu/restaurants/${restaurantId}`
    );
    return data ?? [];
  } catch (error) {
    console.log('Error fetching menu:', error);
    return [];
  }
};
