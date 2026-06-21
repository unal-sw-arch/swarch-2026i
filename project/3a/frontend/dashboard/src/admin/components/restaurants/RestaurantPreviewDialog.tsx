import { useEffect, useState } from "react";
import { Bike, CalendarDays, Check, Clock3, Minus, Plus, ShoppingCart, Star, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Reservation, Restaurant, RestaurantMenuItem } from "@/lib/types";
import { restaurantService } from "@/lib/services/restaurantService";
import { orderService } from "@/lib/services/orderService";
import { getTokenPayload } from "@/lib/auth";
import { reservationService, type SuggestedTimeSlot } from "@/lib/services/reservationService";
import { tableService } from "@/lib/services/tableServices";

interface RestaurantPreviewDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CartMap = Record<string, number>;
type OrderState = "idle" | "placing" | "success" | "error";
type ReservationState = "idle" | "placing" | "success" | "error";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const activeReservationStatuses = ["Pendiente", "Confirmada", "CheckedIn"];

const isOrderableReservation = (reservation: Reservation, restaurantId: string) =>
  reservation.restaurantId === Number(restaurantId) &&
  activeReservationStatuses.includes(reservation.status) &&
  !reservation.orderId;

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
  const [reservationDate, setReservationDate] = useState(today());
  const [partySize, setPartySize] = useState(2);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<SuggestedTimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reservationState, setReservationState] = useState<ReservationState>("idle");
  const [reservationMessage, setReservationMessage] = useState<string | null>(null);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [checkingReservation, setCheckingReservation] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);

  useEffect(() => {
    if (!open) {
      setCart({});
      setNotes("");
      setOrderState("idle");
      setOrderError(null);
      setOrderId(null);
      setReservationDate(today());
      setPartySize(2);
      setSelectedTime("");
      setAvailableSlots([]);
      setSlotsLoading(false);
      setReservationState("idle");
      setReservationMessage(null);
      setHasActiveReservation(false);
      setCheckingReservation(false);
      setActiveReservation(null);
      setIsCancellingReservation(false);
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

  useEffect(() => {
    if (!restaurant || !open) return;
    if (hasActiveReservation) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }
    setSlotsLoading(true);
    setSelectedTime("");
    reservationService
      .getSuggestedTimes(restaurant.id, reservationDate, partySize)
      .then((response) => {
        setAvailableSlots(response.availableSlots.filter((slot) => slot.availableTables > 0));
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [hasActiveReservation, partySize, reservationDate, restaurant?.id, open]);

  useEffect(() => {
    if (!restaurant || !open) return;
    const payload = getTokenPayload();
    if (!payload) return;
    setCheckingReservation(true);
    reservationService
      .getByCustomer(payload.userId)
      .then((reservations) => {
        const activeReservations = reservations.filter((reservation) =>
          reservation.restaurantId === Number(restaurant.id) &&
          activeReservationStatuses.includes(reservation.status)
        );
        const currentReservation =
          activeReservations.find((reservation) => !reservation.orderId) ??
          activeReservations[0];
        setActiveReservation(currentReservation ?? null);
        setHasActiveReservation(Boolean(currentReservation));
      })
      .catch(() => {
        setActiveReservation(null);
        setHasActiveReservation(false);
      })
      .finally(() => setCheckingReservation(false));
  }, [restaurant?.id, open]);

  const cartItems = menuItems.filter((item) => (cart[item.id] ?? 0) > 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.priceNumber ?? 0) * (cart[item.id] ?? 0),
    0,
  );
  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const canOrder = Boolean(restaurant && activeReservation && isOrderableReservation(activeReservation, restaurant.id));
  const orderDisabledMessage = checkingReservation
    ? "Estamos validando tu reserva antes de habilitar pedidos."
    : activeReservation?.orderId
      ? `La reserva #${activeReservation.id} ya tiene el pedido #${activeReservation.orderId} asociado.`
      : "Para ordenar necesitas una reserva activa en este restaurante.";

  const addItem = (id: string) => {
    if (!canOrder) {
      setOrderState("error");
      setOrderError(orderDisabledMessage);
      return;
    }
    setOrderError(null);
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  };

  const removeItem = (id: string) =>
    setCart((c) => {
      const qty = (c[id] ?? 0) - 1;
      if (qty <= 0) {
        const { [id]: _removed, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: qty };
    });

  const handlePlaceOrder = async () => {
    if (!restaurant || cartItems.length === 0) return;
    const payload = getTokenPayload();
    if (!payload) {
      setOrderState("error");
      setOrderError("Necesitas iniciar sesión para realizar un pedido.");
      return;
    }
    if (!activeReservation || !canOrder) {
      setOrderState("error");
      setOrderError(orderDisabledMessage);
      return;
    }
    setOrderState("placing");
    setOrderError(null);
    try {
      const reservationTableId = activeReservation.tableId;
      const tables = reservationTableId
        ? await tableService.getByRestaurantId(restaurant.id)
        : [];
      const reservationTable = tables.find((table) => table.id === reservationTableId);
      const tableNumber = Number(reservationTable?.tableNumber);

      const result = await orderService.placeOrder({
        customerId: payload.userId,
        customerName: payload.name || payload.username,
        restaurantId: Number(restaurant.id),
        restaurantName: restaurant.name,
        channel: "InPerson",
        tableId: null,
        tableNumber: Number.isFinite(tableNumber) ? tableNumber : 0,
        notes: notes.trim() || undefined,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          productName: item.name,
          quantity: cart[item.id],
          unitPrice: item.priceNumber ?? 0,
        })),
      });
      const linkedReservation = await reservationService.linkOrder(activeReservation.id, result.id);
      setActiveReservation(linkedReservation);
      setHasActiveReservation(true);
      setOrderId(result.id);
      setCart({});
      setOrderState("success");
    } catch (err) {
      setOrderState("error");
      setOrderError(err instanceof Error ? err.message : "Error al realizar o vincular el pedido");
    }
  };

  const handleCreateReservation = async () => {
    if (!restaurant || !selectedTime) return;
    const payload = getTokenPayload();
    if (!payload) {
      setReservationState("error");
      setReservationMessage("Necesitas iniciar sesión para reservar.");
      return;
    }

    setReservationState("placing");
    setReservationMessage(null);
    try {
      const reservation = await reservationService.create({
        customerId: payload.userId,
        customerName: payload.name || payload.username,
        restaurantId: Number(restaurant.id),
        restaurantName: restaurant.name,
        reservationDate,
        reservationTime: selectedTime,
        partySize,
        notes: "Reserva creada desde la vista de cliente",
      });
      setReservationState("success");
      setReservationMessage(`Reserva #${reservation.id} creada para las ${reservation.reservationTime}.`);
      setOrderError(null);
      setActiveReservation(reservation);
      setHasActiveReservation(true);
      const refreshed = await reservationService.getSuggestedTimes(restaurant.id, reservationDate, partySize);
      setAvailableSlots(refreshed.availableSlots.filter((slot) => slot.availableTables > 0));
      setSelectedTime("");
    } catch (err) {
      setReservationState("error");
      setReservationMessage(err instanceof Error ? err.message : "No se pudo crear la reserva.");
    }
  };

  const handleCancelReservation = async () => {
    if (!restaurant || !activeReservation) return;
    setIsCancellingReservation(true);
    setReservationMessage(null);
    try {
      await reservationService.updateStatus(activeReservation.id, "Cancelada");
      setActiveReservation(null);
      setHasActiveReservation(false);
      setCart({});
      setOrderError(null);
      setReservationState("idle");
      setReservationMessage("Reserva cancelada. Ya puedes elegir otro horario.");
      const refreshed = await reservationService.getSuggestedTimes(restaurant.id, reservationDate, partySize);
      setAvailableSlots(refreshed.availableSlots.filter((slot) => slot.availableTables > 0));
    } catch (err) {
      setReservationState("error");
      setReservationMessage(err instanceof Error ? err.message : "No se pudo cancelar la reserva.");
    } finally {
      setIsCancellingReservation(false);
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

                {!canOrder && !menuLoading && (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {orderDisabledMessage}
                  </div>
                )}

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
                                  disabled={!canOrder}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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

              <div className="border-t border-gray-200 px-6 py-5">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Reservar mesa</h3>
                  <p className="text-sm text-gray-500">
                    {hasActiveReservation
                      ? "Ya tienes una reserva activa en este restaurante."
                      : "Elige fecha, cantidad de personas y un horario disponible."}
                  </p>
                </div>

                {hasActiveReservation ? (
                  <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <div>
                      <p className="font-semibold">
                        Reserva #{activeReservation?.id}
                      </p>
                      <p>
                        {activeReservation?.reservationDate} · {activeReservation?.reservationTime} ·{" "}
                        {activeReservation?.partySize} {activeReservation?.partySize === 1 ? "persona" : "personas"}
                      </p>
                      {activeReservation?.orderId && (
                        <p className="mt-2 text-amber-700">
                          Pedido #{activeReservation.orderId} asociado a esta reserva.
                        </p>
                      )}
                    </div>
                    <p>Puedes seguir viendo el menú, pero no crear otra reserva hasta cancelar o completar la actual.</p>
                    <button
                      type="button"
                      onClick={handleCancelReservation}
                      disabled={isCancellingReservation}
                      className="w-full rounded-xl border border-red-200 bg-white py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {isCancellingReservation ? "Cancelando..." : "Cancelar reserva"}
                    </button>
                    {reservationMessage && (
                      <p className={`text-sm ${reservationState === "error" ? "text-red-600" : "text-emerald-700"}`}>
                        {reservationMessage}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm font-medium text-gray-700">
                        Fecha
                        <span className="relative block">
                          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            min={today()}
                            value={reservationDate}
                            onChange={(event) => setReservationDate(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </span>
                      </label>

                      <label className="space-y-1.5 text-sm font-medium text-gray-700">
                        Personas
                        <span className="relative block">
                          <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <select
                            value={partySize}
                            onChange={(event) => setPartySize(Number(event.target.value))}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            {Array.from({ length: 12 }, (_, index) => index + 1).map((size) => (
                              <option key={size} value={size}>
                                {size} {size === 1 ? "persona" : "personas"}
                              </option>
                            ))}
                          </select>
                        </span>
                      </label>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Horarios disponibles</p>
                      {checkingReservation || slotsLoading ? (
                        <div className="rounded-xl border border-gray-200 p-3 text-sm text-gray-500">
                          Consultando horarios...
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 p-3 text-sm text-gray-500">
                          No hay horarios para esa fecha y cantidad de personas.
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => {
                                setSelectedTime(slot.time);
                                setReservationMessage(null);
                                setReservationState("idle");
                              }}
                              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                                selectedTime === slot.time
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {reservationMessage && (
                      <p className={`mt-3 text-sm ${reservationState === "error" ? "text-red-600" : "text-emerald-700"}`}>
                        {reservationMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleCreateReservation}
                      disabled={!selectedTime || reservationState === "placing"}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                    >
                      <CalendarDays className="h-4 w-4" />
                      {reservationState === "placing" ? "Reservando..." : "Confirmar reserva"}
                    </button>
                  </>
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
                  disabled={orderState === "placing" || !canOrder}
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
