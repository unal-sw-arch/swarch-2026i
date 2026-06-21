import { gatewayApi } from '@/core/api/gatewayApi';
import type { Order } from '../interface/order';

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export const getOrdersByCustomer = async (customerId: number): Promise<Order[]> => {
  try {
    const { data } = await gatewayApi.get<ApiEnvelope<Order[]>>(
      `/order/customer/${customerId}`
    );
    return data.data ?? [];
  } catch (error) {
    console.log('Error fetching orders:', error);
    return [];
  }
};
