import { productsApi } from '@/core/api/productsApi';
import type { Reservation } from '../interface/reservation';

export const getReservationsByCustomer = async (customerId: number): Promise<Reservation[]> => {
  try {
    const { data } = await productsApi.get<Reservation[]>(
      `/reservation/customer/${customerId}`
    );
    return data ?? [];
  } catch (error) {
    console.log('Error fetching reservations:', error);
    return [];
  }
};
