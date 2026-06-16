import ActivityFeed from "@/admin/components/ActivityFeed";
import type { ActivityItem } from "@/admin/components/ActivityFeed";
import Chart from "@/admin/components/Chart";
import StatCard from "@/admin/components/StatCard";
import { Star, DollarSign, ShoppingCart, Utensils, ChefHat, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { getCurrentUserName } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ratingService } from "@/lib/services/ratingService";
import { orderService } from "@/lib/services/orderService";
import { timeAgo } from "@/lib/utils";
import type { RatingSummary } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

// Resumen de ingresos del backend (MonthlyEarningsResponse)
interface MonthlyEarnings {
  grossEarnings: number;
  deliveredOrders: number;
  averageTicket: number;
}

type ChartDatum = { label: string; value: number };

const ACTIVE_ORDER_STATUSES = new Set(['PENDING', 'IN_PREPARATION', 'READY']);

// Estados de las órdenes (dominio de los chefs) con etiqueta legible
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendientes',
  IN_PREPARATION: 'En preparación',
  READY: 'Listos',
  DELIVERED: 'Enviados',
  CANCELLED: 'Cancelados',
};


export const DashboardPage = () => {
  const { restaurantId } = useAuth();

  const [rating, setRating] = useState<RatingSummary | null>(null);
  const [earnings, setEarnings] = useState<MonthlyEarnings | null>(null);
  const [topDish, setTopDish] = useState<string | null>(null);
  const [waitersData, setWaitersData] = useState<ChartDatum[]>([]);
  const [chefsData, setChefsData] = useState<ChartDatum[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const Name = useMemo(() => {
    const fullName = getCurrentUserName();
    if (!fullName) return 'Usuario';

    // Tomar solo el primer nombre (antes del primer espacio)
    return fullName.trim().split(' ')[0];
  }, []);

  // Cargar datos del dashboard para este restaurante
  const loadDashboardData = async () => {
    if (!restaurantId) return;
    try {
      const now = new Date();
      const [summary, monthly, dish, waiterRatings, allOrders, reviews] = await Promise.all([
        ratingService.getSummary(restaurantId),
        orderService.getMonthlyEarnings(restaurantId, now.getFullYear(), now.getMonth() + 1),
        orderService.getTopDish(restaurantId),
        ratingService.getWaiterRatingsByRestaurant(restaurantId),
        orderService.getByRestaurant(Number(restaurantId)),
        ratingService.getRestaurantRatings(restaurantId),
      ]);
      setRating(summary);
      setEarnings(monthly);
      setTopDish(dish);

      // Meseros: promedio de calificación por mesero (todos los meseros con reseñas)
      const wr = waiterRatings as unknown as { waiterName?: string; waiterId: number; score: number }[];
      const byWaiter = new Map<string, { sum: number; count: number }>();
      wr.forEach((r) => {
        const name = r.waiterName ?? `Mesero ${r.waiterId}`;
        const acc = byWaiter.get(name) ?? { sum: 0, count: 0 };
        acc.sum += r.score;
        acc.count += 1;
        byWaiter.set(name, acc);
      });
      setWaitersData(
        Array.from(byWaiter.entries())
          .map(([label, { sum, count }]) => ({
            label,
            value: Math.round((sum / count) * 10) / 10,
          }))
          .sort((a, b) => b.value - a.value)
      );

      // Chefs: active orders should always appear in the current operational state.
      // Closed orders are shown only when they changed today.
      const today = now.toDateString();
      const statusCounts = allOrders.reduce<Record<string, number>>((acc, o) => {
        const changedAt = o.updatedAt ?? o.createdAt;
        const isActive = ACTIVE_ORDER_STATUSES.has(o.status);
        const changedToday = changedAt ? new Date(changedAt).toDateString() === today : false;
        if (!isActive && !changedToday) return acc;
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {});
      setChefsData(
        Object.keys(ORDER_STATUS_LABELS).map((status) => ({
          label: ORDER_STATUS_LABELS[status],
          value: statusCounts[status] ?? 0,
        }))
      );

      // Actividad reciente: une eventos de órdenes y reseñas, ordenados por fecha
      type OrderRow = {
        id: number;
        status: string;
        totalAmount?: number;
        tableNumber?: number;
        cancellationReason?: string | null;
        createdAt: string;
        updatedAt?: string;
      };
      const orders = allOrders as unknown as OrderRow[];
      const money = (n?: number) => `$${Number(n ?? 0).toLocaleString('es-CO')}`;

      const feed: { at: number; item: ActivityItem }[] = [];

      orders.forEach((o) => {
        const at = new Date(o.updatedAt ?? o.createdAt).getTime();
        const time = timeAgo(o.updatedAt ?? o.createdAt);
        const mesa = `Mesa ${o.tableNumber ?? '—'} · ${money(o.totalAmount)}`;
        switch (o.status) {
          case 'PENDING':
            feed.push({ at, item: { icon: ShoppingCart, color: 'bg-blue-500', title: `Nuevo pedido #${o.id}`, description: mesa, time } });
            break;
          case 'IN_PREPARATION':
            feed.push({ at, item: { icon: ChefHat, color: 'bg-amber-500', title: `Pedido #${o.id} en preparación`, description: mesa, time } });
            break;
          case 'READY':
            feed.push({ at, item: { icon: CheckCircle2, color: 'bg-green-500', title: `Pedido #${o.id} listo para servir`, description: mesa, time } });
            break;
          case 'DELIVERED':
            feed.push({ at, item: { icon: CheckCircle2, color: 'bg-emerald-600', title: `Pedido #${o.id} entregado`, description: mesa, time } });
            break;
          case 'CANCELLED':
            feed.push({ at, item: { icon: XCircle, color: 'bg-gray-500', title: `Pedido #${o.id} cancelado`, description: o.cancellationReason ?? mesa, time } });
            break;
        }
      });

      reviews.forEach((r) => {
        const at = new Date(r.createdAt).getTime();
        const time = timeAgo(r.createdAt);
        const stars = '★'.repeat(r.score);
        const who = r.customerName ?? 'Cliente';
        const text = r.review ? `"${r.review}" — ${who}` : who;
        if (r.score <= 2) {
          feed.push({ at, item: { icon: AlertTriangle, color: 'bg-red-500', title: `Reseña baja ${stars}`, description: text, time } });
        } else {
          feed.push({ at, item: { icon: Star, color: 'bg-yellow-500', title: `Nueva reseña ${stars}`, description: text, time } });
        }
      });

      setActivities(
        feed.sort((a, b) => b.at - a.at).slice(0, 8).map((f) => f.item)
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [restaurantId]);

  // Tarjetas con datos reales del restaurante
  const stats = [
    {
      title: 'Calificación',
      value: rating ? rating.averageScore.toFixed(1) : '—',
      change: rating ? `${rating.totalRatings} reseñas` : 'Sin reseñas',
      changeType: 'neutral' as const,
      icon: Star,
      color: 'bg-yellow-500',
      link: '/ratings',
    },
    {
      title: 'Ingresos del mes',
      value: `$${Number(earnings?.grossEarnings ?? 0).toLocaleString('es-CO')}`,
      change: 'Pedidos entregados',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos entregados',
      value: Number(earnings?.deliveredOrders ?? 0).toLocaleString('es-CO'),
      change: 'Este mes',
      changeType: 'neutral' as const,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Plato más vendido',
      value: topDish ?? '—',
      change: 'Pedidos entregados',
      changeType: 'neutral' as const,
      icon: Utensils,
      color: 'bg-orange-500',
    },
  ];

  return (
    <>
      {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {Name}! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(({ link, ...stat }, index) =>
              link ? (
                <Link key={index} to={link} className="block h-full">
                  <StatCard {...stat} />
                </Link>
              ) : (
                <StatCard key={index} {...stat} />
              )
            )}
          </div>

          {/* Charts and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Chart title="Promedio por Mesero" data={waitersData} max={5} scrollable />
              <Chart title="Estado de Órdenes (Hoy)" data={chefsData} />
            </div>

            <div className="space-y-6">
              <ActivityFeed activities={activities} />
            </div>
          </div>
    </>
  )
}
