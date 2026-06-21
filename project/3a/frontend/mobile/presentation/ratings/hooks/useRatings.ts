import { useQuery } from '@tanstack/react-query';
import { getRatingsByRestaurant } from '@/core/ratings/actions/get-ratings.action';

export const useRatings = (restaurantId: number) => {
  return useQuery({
    queryKey: ['ratings', restaurantId],
    queryFn: () => getRatingsByRestaurant(restaurantId),
    staleTime: 1000 * 60 * 10,
    enabled: !!restaurantId,
  });
};
