import { Bike, Clock3, Star } from "lucide-react";
import type { Restaurant } from "@/lib/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-44 w-full object-cover"
          loading="lazy"
        />

        {restaurant.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow">
            {restaurant.badge}
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-gray-900">{restaurant.name}</h3>
            <p className="truncate text-sm text-gray-500">
              {restaurant.category ?? "Restaurante"} {restaurant.city ? `• ${restaurant.city}` : ""}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {restaurant.deliveryTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bike className="h-4 w-4" />
            {restaurant.price}
          </span>
        </div>
      </div>
    </article>
  );
};

