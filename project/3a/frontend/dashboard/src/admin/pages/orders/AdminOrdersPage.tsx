import { useEffect, useState } from "react";
import { RefreshCw, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  orderService,
  getMinutes,
  getTimeColor,
  getNextStatus,
  isTableFree,
} from "@/lib/services/orderService";
import { tableService } from "@/lib/services/tableServices";
import type { Order, OrderStatus, Table } from "@/lib/types";

const STATUS_OPTIONS: (OrderStatus | "ALL")[] = [
  "ALL",
  "Pending",
  "SentToKitchen",
  "Preparing",
  "Ready",
  "Served",
];

export const AdminOrdersPage = () => {
  const { restaurantId } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTables, setSelectedTables] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // 🔄 Cargar órdenes
  const loadOrders = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await orderService.getActive(Number(restaurantId));
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🍽️ Cargar mesas disponibles
  const loadTables = async () => {
    if (!restaurantId) return;
    const data = await tableService.getByRestaurantId(restaurantId);

    const freeTables = data.filter((t) => t.status === "AVAILABLE");
    setTables(freeTables);
  };

  // ⏱️ Auto refresh
  useEffect(() => {
    loadOrders();
    loadTables();

    const interval = setInterval(() => {
      loadOrders();
      loadTables();
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
      await loadOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🍽️ Confirmar mesa
  const handleConfirmTable = async (order: Order) => {
    const tableId = selectedTables[order.id];

    if (!tableId) {
      alert("Selecciona una mesa");
      return;
    }

    if (!tables.find((t) => t.id === tableId)) {
      alert("Mesa inválida");
      return;
    }

    if (!isTableFree(tableId, orders)) {
      alert("⚠️ La mesa ya está ocupada");
      return;
    }

    try {
      await orderService.assignTable(order.id, tableId);
      await tableService.updateStatus(tableId, "OCCUPIED");

      setSelectedTables((prev) => {
        const copy = { ...prev };
        delete copy[order.id];
        return copy;
      });

      await loadOrders();
      await loadTables();
    } catch (error) {
      console.error(error);
      alert("Error asignando mesa");
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
          <h1 className="text-2xl font-bold text-gray-900">Órdenes Activas</h1>
          <p className="text-sm text-gray-500">Gestión en tiempo real</p>
        </div>

        <button
          onClick={loadOrders}
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
                    order.status === "Preparing"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Ready"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Pending"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* INFO */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Mesa:{" "}
                  {order.tableId ? `#${order.tableId}` : "Sin asignar"}
                </span>
                <span
                  className={`flex items-center gap-1 ${getTimeColor(minutes)}`}
                >
                  <Clock size={14} />
                  {minutes} min
                </span>
              </div>

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
                      : getNextStatus(order.status)}
                  </button>
                )}

                {/* SELECT MESA */}
                <select
                  value={selectedTables[order.id] ?? ""}
                  onChange={(e) =>
                    setSelectedTables((prev) => ({
                      ...prev,
                      [order.id]: Number(e.target.value),
                    }))
                  }
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="">Seleccionar mesa</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Mesa {table.tableNumber}
                    </option>
                  ))}
                </select>

                {/* CONFIRMAR */}
                <button
                  onClick={() => handleConfirmTable(order)}
                  disabled={!selectedTables[order.id]}
                  className={`text-xs px-3 py-1 rounded-md ${
                    selectedTables[order.id]
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-400 text-sm">
          No hay órdenes activas
        </p>
      )}
    </div>
  );
};