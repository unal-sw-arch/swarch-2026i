import { gatewayApi } from '@/core/api/gatewayApi';
import type { Order } from '../interface/order';

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const { data } = await gatewayApi.get<ApiEnvelope<Order>>(`/order/${id}`);
    return data.data;
  } catch (error) {
    console.log('Error fetching order:', error);
    return null;
  }
};
