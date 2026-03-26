import { productsApi } from "@/core/api/productsApi";
import Restaurant from "../interface/restaurant";

interface NearbySearchRequest {
    latitude: number;
    longitude: number;
    radiusInKm: number;
}

interface RestaurantsResponse {
    data: Restaurant[];
    message?: string;
}

export const getRestaurants = async (
    latitude: number = 0,
    longitude: number = 0,
    radiusInKm: number = 5
): Promise<Restaurant[]> => {
    try {
        console.log('🍽️  Fetching nearby restaurants...');
        
        const response = await productsApi.get<RestaurantsResponse>(
            '/api/restaurants/nearby',
            {
                data: {
                    latitude,
                    longitude,
                    radiusInKm,
                } as NearbySearchRequest,
            }
        );

        console.log('✅ Restaurants fetched successfully:', response.data);
        return response.data.data || [];
    } catch (error) {
        console.log('❌ Error fetching restaurants:', error);
        return [];
    }
};

