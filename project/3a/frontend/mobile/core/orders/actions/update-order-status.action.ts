import { gatewayApi } from '@/core/api/gatewayApi';
import type { Order, OrderStatus } from '../interface/order';

interface ApiEnvelope<T> {
    message: string;
    data: T;
}

export const updateOrderStatus = async (
    orderId: number,
    status: OrderStatus,
): Promise<Order> => {
    const { data } = await gatewayApi.patch<ApiEnvelope<Order>>(
        `/order/${orderId}/status`,
        { status },
    );
    return data.data;
};
