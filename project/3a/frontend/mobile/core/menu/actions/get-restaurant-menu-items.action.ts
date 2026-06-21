import { gatewayApi } from '@/core/api/gatewayApi';
import type { MenuItem } from '../interface/menu-item';

// MenuService returns the raw list without the ApiResponse envelope for this
// endpoint, so we type it directly as MenuItem[].
export const getRestaurantMenuItems = async (
    restaurantId: number,
): Promise<MenuItem[]> => {
    try {
        const { data } = await gatewayApi.get<MenuItem[]>(
            `/menu/restaurants/${restaurantId}/items`,
        );
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.log('getRestaurantMenuItems error:', error);
        return [];
    }
};
