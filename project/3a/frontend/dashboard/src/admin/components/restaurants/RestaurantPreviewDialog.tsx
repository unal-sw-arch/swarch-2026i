import { useEffect, useState } from "react";
import { Bike, Check, Clock3, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Restaurant, RestaurantMenuItem } from "@/lib/types";
import { restaurantService } from "@/lib/services/restaurantService";
import { orderService } from "@/lib/services/orderService";
import { getTokenPayload } from "@/lib/auth";

interface RestaurantPreviewDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CartMap = Record<string, number>;
type OrderState = "idle" | "placing" | "success" | "error";

export const RestaurantPreviewDialog = ({
  restaurant,
  open,
  onOpenChange,
}: RestaurantPreviewDialogProps) => {
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [cart, setCart] = useState<CartMap>({});
  const [notes, setNotes] = useState("");
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setCart({});
      setNotes("");
      setOrderState("idle");
      setOrderError(null);
      setOrderId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!restaurant || !open) return;
    setMenuLoading(true);
    restaurantService
      .getMenuItems(restaurant.id)
      .then(setMenuItems)
      .catch(() => setMenuItems([]))
      .finally(() => setMenuLoading(false));
  }, [restaurant?.id, open]);

  const addItem = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  const removeItem = (id: string) =>
    setCart((c) => {
      const qty = (c[id] ?? 0) - 1;
      if (qty <= 0) {
        const { [id]: _removed, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: qty };
    });

  const cartItems = menuItems.filter((item) => (cart[item.id] ?? 0) > 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.priceNumber ?? 0) * (cart[item.id] ?? 0),
    0,
  );
  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);

  const handlePlaceOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    const payload = getTokenPayload();
    if (!payload) {
      setOrderState("error");
      setOrderError("Necesitas iniciar sesión para realizar un pedido.");
      return;
    }
    setOrderState("placing");
    setOrderError(null);
    try {
      const result = await orderService.placeOrder({
        customerId: payload.userId,
        customerName: payload.name || payload.username,
        restaurantId: Number(restaurant.id),
        restaurantName: restaurant.name,
        channel: "InPerson",
        notes: notes.trim() || undefined,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          productName: item.name,
          quantity: cart[item.id],
          unitPrice: item.priceNumber ?? 0,
        })),
      });
      setOrderId(result.id);
      setOrderState("success");
    } catch (err) {
      setOrderState("error");
      setOrderError(err instanceof Error ? err.message : "Error al realizar el pedido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {restaurant && orderState === "success" ? (
          <div className="flex flex-col items-center gap-5 p-10 text-center">
            <DialogHeader className="sr-only">
              <DialogTitle>Pedido confirmado</DialogTitle>
              <DialogDescription>Tu pedido ha sido recibido</DialogDescription>
            </DialogHeader>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">¡Pedido realizado!</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tu pedido #{orderId} en{" "}
                <span className="font-semibold">{restaurant.name}</span> ha sido recibido.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        ) : restaurant ? (
          <>
            {/* Scrollable menu area */}
            <div className="flex-1 overflow-y-auto">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-44 w-full object-cover"
              />

              <div className="space-y-3 px-6 pt-5 pb-2">
                <DialogHeader>
                  <DialogTitle className="text-xl">{restaurant.name}</DialogTitle>
                  <DialogDescription>
                    {restaurant.category ?? "Restaurante"}
                    {restaurant.city ? ` • ${restaurant.city}` : ""}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
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
              </div>

              <div className="px-6 pb-6 pt-4">
                <h3 className="mb-3 text-base font-semibold text-gray-900">Menú</h3>

                {menuLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                        <div className="h-20 w-24 animate-pulse rounded-lg bg-gray-100 shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : menuItems.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay items en el menú.</p>
                ) : (
                  <div className="space-y-3">
                    {menuItems.map((item) => {
                      const qty = cart[item.id] ?? 0;
                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-xl border border-gray-200 p-3 transition-colors hover:border-blue-200"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-24 shrink-0 rounded-lg object-cover"
                            loading="lazy"
                          />
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
                                {item.description}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-blue-700">
                                {item.price}
                              </span>
                              <div className="flex items-center gap-2">
                                {qty > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
                                    >
                                      <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="min-w-6 text-center text-sm font-semibold text-gray-900">
                                      {qty}
                                    </span>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => addItem(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Cart + order — only visible when cart has items */}
            {cartItems.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 bg-white px-6 py-4">
                <div className="space-y-1.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm text-gray-700"
                    >
                      <span className="truncate">
                        <span className="font-medium">{cart[item.id]}×</span> {item.name}
                      </span>
                      <span className="shrink-0 font-medium">
                        {item.priceNumber != null
                          ? `$ ${(item.priceNumber * cart[item.id]).toLocaleString("es-CO")}`
                          : item.price}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 font-semibold text-gray-900">
                    <span>Total</span>
                    <span>$ {cartTotal.toLocaleString("es-CO")}</span>
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas para el pedido (opcional)"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                {orderError && (
                  <p className="text-sm text-red-600">{orderError}</p>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={orderState === "placing"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {orderState === "placing"
                    ? "Procesando..."
                    : `Realizar pedido · ${totalQty} item${totalQty !== 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
