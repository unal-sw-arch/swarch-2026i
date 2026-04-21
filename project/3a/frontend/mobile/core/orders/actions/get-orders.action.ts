import { productsApi } from '@/core/api/productsApi';
import type { Order } from '../interface/order';

export const getOrdersByCustomer = async (customerId: number): Promise<Order[]> => {
  try {
    const { data } = await productsApi.get<Order[]>(
      `/order/customer/${customerId}`
    );
    return data ?? [];
  } catch (error) {
    console.log('Error fetching orders:', error);
    return [];
  }
};
