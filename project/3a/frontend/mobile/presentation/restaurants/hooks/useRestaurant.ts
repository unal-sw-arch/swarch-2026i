import { useQuery } from '@tanstack/react-query';
import { getRestaurantById } from '@/core/restaurants/actions/get-restaurant-by-id.action';

export const useRestaurant = (id: number) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id),
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
  });
};
