import { useEffect, useState } from "react";
import { RefreshCw, Clock, ArrowUp, ArrowDown, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  orderService,
  getMinutes,
  getTimeColor,
  getNextStatus,
} from "@/lib/services/orderService";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: (OrderStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "IN_PREPARATION",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  IN_PREPARATION: "En preparación",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const AdminOrdersPage = () => {
  const { restaurantId } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // 🔄 Cargar órdenes
  const loadOrders = async (showLoading = false) => {
    if (!restaurantId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    try {
      const data = await orderService.getByRestaurant(Number(restaurantId));
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ⏱️ Auto refresh
  useEffect(() => {
    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  // 🔄 Cambiar estado
  const handleNextStatus = async (order: Order) => {
    const next = getNextStatus(order.status);
    if (!next) return;

    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, next);
      await loadOrders(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriority = async (order: Order, delta: number) => {
    setUpdatingId(order.id);
    try {
      await orderService.updatePriority(order.id, Math.max(0, order.priority + delta));
      await loadOrders(false);
    } catch (err) {
      console.error(err);
      alert("Error actualizando prioridad");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order: Order) => {
    const reason = window.prompt("Motivo de cancelación", "El cliente no llegó a tiempo");
    if (!reason?.trim()) return;
    setUpdatingId(order.id);
    try {
      await orderService.cancelOrder(order.id, reason.trim());
      await loadOrders(false);
    } catch (err) {
      console.error(err);
      alert("Error cancelando la orden");
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔍 Filtro
  const filteredOrders = orders.filter(
    (o) => statusFilter === "ALL" || o.status === statusFilter
  );

  if (loading)
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
        <p className="text-gray-500">Cargando órdenes...</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes del Restaurante</h1>
          <p className="text-sm text-gray-500">Historial, prioridad y estado</p>
        </div>

        <button
          onClick={() => loadOrders(false)}
          className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <RefreshCw size={16} />
          Refrescar
        </button>
      </div>

      {/* FILTRO */}
      <div className="bg-white p-4 border rounded-xl shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "ALL")
          }
          className="border p-2 rounded-md text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "Todas" : s}
            </option>
          ))}
        </select>
      </div>

      {/* LISTA */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const minutes = getMinutes(order.createdAt);

          return (
            <div
              key={order.id}
              className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-800">
                    Orden #{order.id}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {order.customerName}
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    order.status === "IN_PREPARATION"
                      ? "bg-yellow-100 text-yellow-700"
                    : order.status === "READY"
                      ? "bg-green-100 text-green-700"
                      : order.status === "PENDING"
                      ? "bg-gray-100 text-gray-700"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                    {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* INFO */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Mesa:{" "}
                    {order.tableNumber ? `#${order.tableNumber}` : "Sin asignar"}
                </span>
                <span
                  className={`flex items-center gap-1 ${getTimeColor(minutes)}`}
                >
                  <Clock size={14} />
                  {minutes} min
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Total: ${order.total.toLocaleString("es-CO")}</span>
                <span>Prioridad: {order.priority}</span>
              </div>

              {order.arrivalMessage && (
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                  <strong>Mensaje:</strong> {order.arrivalMessage}
                  {order.requestedArrivalTime && (
                    <span> · Llegada: {new Date(order.requestedArrivalTime).toLocaleString()}</span>
                  )}
                </div>
              )}

              {order.cancellationReason && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  <strong>Cancelación:</strong> {order.cancellationReason}
                </div>
              )}

              {/* ITEMS */}
              <div className="text-xs text-gray-500 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id}>
                    {item.quantity}x {item.productName}
                  </div>
                ))}
              </div>

              {/* ACCIONES */}
              <div className="flex gap-2 flex-wrap mt-2">
                {/* CAMBIAR ESTADO */}
                {getNextStatus(order.status) && (
                  <button
                    onClick={() => handleNextStatus(order)}
                    disabled={updatingId === order.id}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-md"
                  >
                    {updatingId === order.id
                      ? "..."
                      : STATUS_LABELS[getNextStatus(order.status)!]}
                  </button>
                )}

                <button
                  onClick={() => handlePriority(order, 1)}
                  disabled={updatingId === order.id || order.status === "DELIVERED" || order.status === "CANCELLED"}
                  className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-md disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <ArrowUp size={12} /> Priorizar
                </button>

                <button
                  onClick={() => handlePriority(order, -1)}
                  disabled={updatingId === order.id || order.priority === 0 || order.status === "DELIVERED" || order.status === "CANCELLED"}
                  className="inline-flex items-center gap-1 text-xs bg-slate-600 text-white px-3 py-1 rounded-md disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <ArrowDown size={12} /> Bajar
                </button>

                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCancel(order)}
                    disabled={updatingId === order.id}
                    className="inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1 rounded-md"
                  >
                    <XCircle size={12} /> Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-400 text-sm">
          No hay órdenes para este filtro
        </p>
      )}
    </div>
  );
};
