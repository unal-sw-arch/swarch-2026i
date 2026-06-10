import { gatewayApi } from '@/core/api/gatewayApi';
import type { Order, OrderStatus } from '../interface/order';

interface ApiEnvelope<T> {
    message: string;
    data: T;
}

export const getRestaurantOrders = async (
    restaurantId: number,
    status?: OrderStatus,
): Promise<Order[]> => {
    const { data } = await gatewayApi.get<ApiEnvelope<Order[]>>(
        `/order/restaurant/${restaurantId}`,
        { params: status ? { status } : undefined },
    );
    return data.data ?? [];
};
