import { getRestaurants } from "@/core/restaurants/actions/get-restaurants.action"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useRestaurants = () => {

    const restaurantsQuery = useInfiniteQuery({
        queryKey: ['restaurants', 'infinite'],
        queryFn: () => getRestaurants(40.7128, -74.0060, 5),

        staleTime: 1000 * 60 * 60, // 1 Hour

        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => allPages.length,
    });

    return {

        restaurantsQuery,

        //Methods
        loadNextPage: restaurantsQuery.fetchNextPage,

    }
}
