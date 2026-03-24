import { orderApi } from '../api/client';
import type { MenuItem, OrderPayload, OrderConfirmation } from '../types';

export const getMenuItems = async (menuId: string | number): Promise<MenuItem[]> => {
    const response = await orderApi.get(`/menus/${menuId}/items`);
    return response.data;
};

export const createOrder = async (orderData: OrderPayload): Promise<OrderConfirmation> => {
    const response = await orderApi.post('/orders', orderData);
    return response.data;
};

export const getOrderById = async (id: string | number): Promise<OrderConfirmation> => {
    const response = await orderApi.get(`/orders/${id}`);
    return response.data;
};
