import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/lib/services/orderService";
import type { Order } from "@/lib/types";
import { DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react";

export const AdminReportsPage = () => {
  const { restaurantId } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await orderService.getByRestaurant(Number(restaurantId));
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const completed = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Cancelled"
  );

  const revenue = completed
    .filter((o) => o.status === "Delivered")
    .reduce((acc, o) => acc + o.total, 0);

  const totalOrders = completed.length;

  const avgTicket = totalOrders ? revenue / totalOrders : 0;

  const avgPrep =
    completed.reduce((acc, o) => acc + (o.preparationMinutes || 0), 0) /
    (totalOrders || 1);

  const delivered = completed.filter(o => o.status === "Delivered").length;
  const cancelled = completed.filter(o => o.status === "Cancelled").length;

  const productMap: Record<string, number> = {};

  completed.forEach(order => {
    order.items.forEach(item => {
      productMap[item.productName] =
        (productMap[item.productName] || 0) + item.quantity;
    });
  });

  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading)
    return <p className="p-10 text-center text-gray-400">Cargando reporte...</p>;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm">Resumen general del restaurante</p>
      </div>

      {/* 🔥 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Ingresos" value={`$${revenue.toLocaleString("es-CO")}`} icon={<DollarSign />} color="green" />
        <Card title="Órdenes" value={totalOrders} icon={<ShoppingCart />} color="blue" />
        <Card title="Ticket Prom." value={`$${avgTicket.toFixed(0)}`} icon={<TrendingUp />} color="purple" />
        <Card title="Prep Prom." value={`${avgPrep.toFixed(1)} min`} icon={<Clock />} color="orange" />
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* 📊 ESTADOS */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Estados de órdenes</h2>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Entregadas</span>
            <span className="text-green-600 font-bold text-lg">{delivered}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Canceladas</span>
            <span className="text-red-500 font-bold text-lg">{cancelled}</span>
          </div>
        </div>

        {/* 🍔 TOP PRODUCTOS */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Top productos</h2>

          <div className="space-y-3">
            {topProducts.map(([name, qty], index) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  #{index + 1} {name}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {qty}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📋 TABLA */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Orden</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Total</th>
              <th className="text-left">Estado</th>
              <th className="text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-bold">#{o.id}</td>
                <td>{o.customerName}</td>
                <td>${o.total.toLocaleString("es-CO")}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      o.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>

                <td className="text-gray-500 text-xs">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 🔥 KPI CARD PRO
const Card = ({ title, value, icon, color }: any) => {
  const colors: any = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h2 className="text-lg font-bold text-gray-900">{value}</h2>
      </div>
    </div>
  );
};