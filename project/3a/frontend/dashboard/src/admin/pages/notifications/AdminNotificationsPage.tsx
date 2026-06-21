import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock4, RefreshCw } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  notificationService,
  type RestaurantNotification,
} from "@/lib/services/notificationService";

const typeLabels: Record<string, string> = {
  NEW_ORDER: "Orden",
  ORDER_READY: "Orden",
  ORDER_STATUS_CHANGED: "Orden",
  RESERVATION_CONFIRMED: "Reserva",
  RESERVATION_CANCELLED: "Reserva",
  WAITER_CALL: "Servicio",
  GENERAL: "General",
};

const typeColors: Record<string, string> = {
  Orden: "bg-blue-100 text-blue-700",
  Reserva: "bg-emerald-100 text-emerald-700",
  Servicio: "bg-purple-100 text-purple-700",
  General: "bg-slate-100 text-slate-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const notificationKind = (type: string) => typeLabels[type] ?? "General";

export const AdminNotificationsPage = () => {
  const { restaurantId } = useAuth();
  const [notifications, setNotifications] = useState<RestaurantNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!restaurantId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await notificationService.getByRestaurant(restaurantId);
      setNotifications(data);
      notificationService.markRestaurantSeen(restaurantId);
      setError(null);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">
            Eventos reales del restaurante: reservas, órdenes y cambios de estado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadNotifications()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Refrescar
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Bell size={16} />
            <span>
              {restaurantId ? `Restaurante #${restaurantId}` : "Sin restaurante asociado"}
            </span>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {notifications.length} eventos
          </span>
        </div>

        {loading && (
          <div className="py-10 text-center text-sm text-gray-500">
            Cargando notificaciones...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            No hay notificaciones para este restaurante.
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const kind = notificationKind(notification.type);
              return (
                <div key={notification.id} className="py-3 flex items-start gap-3">
                  <div className="mt-0.5">
                    {notification.read ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Clock4 size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[kind]}`}>
                        {kind}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      Usuario #{notification.userId}
                      {notification.orderId ? ` · Orden #${notification.orderId}` : ""}
                      {notification.read ? " · Leida por destinatario" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
