import { useQuery } from '@tanstack/react-query';
import { getMenuByRestaurant } from '@/core/menu/actions/get-menu-by-restaurant.action';

export const useMenu = (restaurantId: number) => {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => getMenuByRestaurant(restaurantId),
    staleTime: 1000 * 60 * 10,
    enabled: !!restaurantId,
  });
};
