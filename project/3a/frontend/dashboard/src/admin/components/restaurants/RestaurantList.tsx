import type { Restaurant } from "@/lib/types";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRestaurantClick?: (restaurant: Restaurant) => void;
}

export const RestaurantList = ({ restaurants, onRestaurantClick }: RestaurantListProps) => {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={onRestaurantClick} />
      ))}
    </section>
  );
};
