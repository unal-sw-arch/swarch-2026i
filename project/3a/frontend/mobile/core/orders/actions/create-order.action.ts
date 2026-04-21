import { gatewayApi } from '@/core/api/gatewayApi';
import type { CreateOrderInput, Order } from '../interface/order';

interface ApiEnvelope<T> {
    message: string;
    data: T;
}

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
    const { data } = await gatewayApi.post<ApiEnvelope<Order>>('/order', {
        restaurantId: input.restaurantId,
        tableNumber: input.tableNumber,
        notes: input.notes ?? null,
        items: input.items.map((item) => ({
            itemName: item.itemName,
            notes: item.notes ?? null,
        })),
    });
    return data.data;
};
