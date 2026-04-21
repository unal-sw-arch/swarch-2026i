import { productsApi } from '@/core/api/productsApi';
import type { Rating } from '../interface/rating';

export const getRatingsByRestaurant = async (restaurantId: number): Promise<Rating[]> => {
  try {
    const { data } = await productsApi.get<Rating[]>(
      `/rating/restaurant/${restaurantId}`
    );
    return data ?? [];
  } catch (error) {
    console.log('Error fetching ratings:', error);
    return [];
  }
};
