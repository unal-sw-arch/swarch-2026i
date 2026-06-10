import { Bike, Clock3, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Restaurant } from "@/lib/types";
import { defaultRestaurantMenu, restaurantMenuById } from "@/lib/mocks/restaurantMenu.mock";

interface RestaurantPreviewDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RestaurantPreviewDialog = ({ restaurant, open, onOpenChange }: RestaurantPreviewDialogProps) => {
  const menuItems = restaurant ? restaurantMenuById[restaurant.id] ?? defaultRestaurantMenu : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {restaurant && (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle>{restaurant.name}</DialogTitle>
              <DialogDescription>
                {restaurant.category ?? "Restaurante"} {restaurant.city ? `• ${restaurant.city}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-52 w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {restaurant.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {restaurant.deliveryTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Bike className="h-4 w-4" />
                {restaurant.price}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Menu destacado</h3>
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-lg border border-gray-200 p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-24 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="mt-1 text-sm font-semibold text-blue-700">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
