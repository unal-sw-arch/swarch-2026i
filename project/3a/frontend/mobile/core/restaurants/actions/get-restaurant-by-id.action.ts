import { productsApi } from "@/core/api/productsApi";
import Restaurant from "../interface/restaurant";


export const getRestaurantById = async (id: number): Promise<Restaurant | null> => {
    try {
        console.log('🍽️  Fetching restaurant with ID:', id);
        
        const response = await productsApi.get<Restaurant>(
            `/restaurant/${id}`
        );

        console.log('✅ Restaurant fetched:', response.data);
        return response.data;
    } catch (error) {
        console.log('❌ Error fetching restaurant:', error);
        return null;
    }
};