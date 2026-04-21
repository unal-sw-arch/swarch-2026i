import { productsApi } from '@/core/api/productsApi';
import type { CreateRatingRequest, Rating } from '../interface/rating';

export const createRating = async (rating: CreateRatingRequest): Promise<Rating | null> => {
  try {
    const { data } = await productsApi.post<Rating>('/rating', rating);
    return data;
  } catch (error) {
    console.log('Error creating rating:', error);
    return null;
  }
};
