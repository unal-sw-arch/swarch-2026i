import { productsApi } from '@/core/api/productsApi';
import type { CreateReservationRequest, Reservation } from '../interface/reservation';

export const createReservation = async (
  reservation: CreateReservationRequest
): Promise<Reservation | null> => {
  try {
    const { data } = await productsApi.post<Reservation>(
      '/reservation',
      reservation
    );
    return data;
  } catch (error) {
    console.log('Error creating reservation:', error);
    return null;
  }
};
