import { productsApi } from '@/core/api/productsApi';
import type { Order } from '../interface/order';

export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const { data } = await productsApi.get<Order>(`/order/${id}`);
    return data;
  } catch (error) {
    console.log('Error fetching order:', error);
    return null;
  }
};
