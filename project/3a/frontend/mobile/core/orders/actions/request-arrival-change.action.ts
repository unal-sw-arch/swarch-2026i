import { gatewayApi } from '@/core/api/gatewayApi';
import type { Order } from '../interface/order';

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export const requestArrivalChange = async (
  orderId: number,
  requestedArrivalTime: string,
  message: string,
): Promise<Order | null> => {
  try {
    const { data } = await gatewayApi.patch<ApiEnvelope<Order>>(`/order/${orderId}/arrival`, {
      requestedArrivalTime,
      message,
    });
    return data.data;
  } catch (error) {
    console.log('Error requesting arrival change:', error);
    return null;
  }
};