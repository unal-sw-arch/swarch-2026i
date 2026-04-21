import { trackingApi } from '../api/client';
import type { OrderEvent } from '../types';

export const getOrderHistory = async (orderId: string | number): Promise<OrderEvent[]> => {
    const response = await trackingApi.get(`/activities/order/${orderId}`);
    // The backend returns { orderId: "...", events: [...] }, so we extract the events array
    return response.data.events ? response.data.events : response.data;
};
