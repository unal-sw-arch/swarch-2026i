import { gatewayApi } from '@/core/api/gatewayApi';
import type { EtaMode, OrderEta } from '../interface/order';

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export const getOrderEta = async (
  orderId: number,
  latitude: number,
  longitude: number,
  mode: EtaMode,
): Promise<OrderEta | null> => {
  try {
    const { data } = await gatewayApi.get<ApiEnvelope<OrderEta>>(`/order/${orderId}/eta`, {
      params: { latitude, longitude, mode },
    });
    return data.data;
  } catch (error) {
    console.log('Error fetching order ETA:', error);
    return null;
  }
};