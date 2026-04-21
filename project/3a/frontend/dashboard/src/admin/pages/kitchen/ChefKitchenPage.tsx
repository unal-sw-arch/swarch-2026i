import { useCallback, useEffect, useRef, useState } from 'react';
import { ChefHat, Clock, RefreshCw, AlertCircle, UtensilsCrossed, Radio, RadioTower } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { kitchenOrderService } from '@/lib/services/kitchenOrderService';
import { subscribeKitchen, type KitchenEvent } from '@/lib/services/kitchenRealtime';
import type { KitchenOrder, KitchenOrderStatus } from '@/lib/types';

// Safety-net polling: the realtime channel is the primary mechanism, but this
// keeps the UI correct on reconnects, transient network errors, or missed
// frames. Short enough to recover quickly, long enough to not hit the backend.
const SAFETY_POLL_INTERVAL_MS = 60_000;
const RESTAURANT_ID = 1;

const STATUS_CONFIG: Record<KitchenOrderStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
  badgeVariant: 'warning' | 'info' | 'success' | 'error' | 'default';
}> = {
  PENDING:        { label: 'Pendiente',       bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-l-amber-400',   badgeVariant: 'warning' },
  IN_PREPARATION: { label: 'En preparación',  bg: 'bg-blue-50',    text: 'text-blue-800',    border: 'border-l-blue-500',    badgeVariant: 'info' },
  READY:          { label: 'Listo',            bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-l-emerald-500', badgeVariant: 'success' },
  DELIVERED:      { label: 'Entregado',        bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-l-gray-400',    badgeVariant: 'default' },
  CANCELLED:      { label: 'Cancelado',        bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-l-red-400',     badgeVariant: 'error' },
};

const NEXT_ACTION: Partial<Record<KitchenOrderStatus, { target: KitchenOrderStatus; label: string }>> = {
  PENDING:        { target: 'IN_PREPARATION', label: 'Iniciar preparación' },
  IN_PREPARATION: { target: 'READY',          label: 'Marcar listo' },
  READY:          { target: 'DELIVERED',       label: 'Entregar' },
};

const CANCELLABLE: KitchenOrderStatus[] = ['PENDING', 'IN_PREPARATION'];

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h ${mins % 60}m`;
}

// Agrupa unidades consecutivas con el mismo (itemName, notes) para mostrarlas
// como "2x Hamburguesa" manteniendo la capacidad de tener notas distintas
// ("1x Hamburguesa sin lechuga", "1x Hamburguesa con todo") en la misma orden.
interface GroupedItem {
  key: string;
  itemName: string;
  notes: string | null;
  count: number;
}

function groupItems(items: { id: number; itemName: string; notes: string | null }[]): GroupedItem[] {
  const groups: GroupedItem[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last.itemName === it.itemName && (last.notes ?? '') === (it.notes ?? '')) {
      last.count += 1;
    } else {
      groups.push({
        key: `${it.itemName}|${it.notes ?? ''}|${it.id}`,
        itemName: it.itemName,
        notes: it.notes,
        count: 1,
      });
    }
  }
  return groups;
}

// Active statuses shown on the kitchen board. DELIVERED and CANCELLED are
// filtered out (they represent completed or aborted orders).
const ACTIVE_STATUSES: KitchenOrderStatus[] = ['PENDING', 'IN_PREPARATION', 'READY'];

export const ChefKitchenPage = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [liveConnected, setLiveConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await kitchenOrderService.getKitchenOrders(RESTAURANT_ID);
      setOrders(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError('No se pudo conectar con el servicio de órdenes');
      console.error('Error loading kitchen orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge a realtime event into the local order list. For CREATED we append,
  // for STATUS_CHANGED we update in place (and remove if the new status leaves
  // the active board, e.g. DELIVERED/CANCELLED).
  const applyEvent = useCallback((event: KitchenEvent) => {
    setOrders(prev => {
      const incoming = event.order;
      const isActive = ACTIVE_STATUSES.includes(incoming.status);
      const exists = prev.some(o => o.id === incoming.id);

      if (event.type === 'ORDER_CREATED') {
        if (exists) return prev;
        return isActive ? [...prev, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : prev;
      }
      // ORDER_STATUS_CHANGED
      if (!exists) {
        return isActive ? [...prev, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : prev;
      }
      return isActive
        ? prev.map(o => (o.id === incoming.id ? incoming : o))
        : prev.filter(o => o.id !== incoming.id);
    });
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    loadOrders(true);

    const handle = subscribeKitchen(
      RESTAURANT_ID,
      applyEvent,
      setLiveConnected,
    );
    intervalRef.current = setInterval(() => loadOrders(false), SAFETY_POLL_INTERVAL_MS);

    return () => {
      handle.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadOrders, applyEvent]);

  const handleStatusChange = async (orderId: number, newStatus: KitchenOrderStatus) => {
    setUpdatingIds(prev => new Set(prev).add(orderId));
    try {
      await kitchenOrderService.updateOrderStatus(orderId, newStatus);
      await loadOrders(false);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const prepCount = orders.filter(o => o.status === 'IN_PREPARATION').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cocina</h1>
            <p className="text-sm text-gray-500">Órdenes activas del restaurante</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">{pendingCount} pendientes</span>
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">{prepCount} en prep.</span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">{readyCount} listos</span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${liveConnected ? 'text-emerald-600' : 'text-gray-400'}`}
            title={liveConnected ? 'Canal en vivo conectado' : 'Canal en vivo desconectado (usando polling)'}
          >
            {liveConnected ? <RadioTower className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
            <span>{liveConnected ? 'En vivo' : 'Offline'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{lastRefresh.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadOrders(false)}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refrescar
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => loadOrders(true)}>Reintentar</Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <UtensilsCrossed className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No hay órdenes activas</p>
          <p className="text-sm">Las nuevas órdenes aparecerán aquí automáticamente</p>
        </div>
      )}

      {/* Order grid */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status];
            const action = NEXT_ACTION[order.status];
            const canCancel = CANCELLABLE.includes(order.status);
            const isUpdating = updatingIds.has(order.id);

            return (
              <div
                key={order.id}
                className={`rounded-xl border border-gray-200 shadow-sm overflow-hidden border-l-4 ${config.border} ${config.bg} transition-all`}
              >
                {/* Card header */}
                <div className="p-4 pb-2 flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">Mesa {order.tableNumber}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(order.createdAt)}</span>
                      <span className="text-gray-300">|</span>
                      <span>#{order.id}</span>
                    </div>
                  </div>
                  <Badge variant={config.badgeVariant}>{config.label}</Badge>
                </div>

                {/* Items list (grouped by itemName+notes) */}
                <div className="px-4 py-2">
                  <ul className="space-y-1.5">
                    {groupItems(order.items).map(group => (
                      <li key={group.key}>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-800">
                            {group.count}x {group.itemName}
                          </span>
                        </div>
                        {group.notes && (
                          <p className="text-xs text-gray-500 ml-5 italic">→ {group.notes}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order notes */}
                {order.notes && (
                  <div className="mx-4 mb-2 p-2 bg-white/60 rounded-lg border border-gray-200/50">
                    <p className="text-xs text-gray-600 italic">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 pt-2 flex gap-2">
                  {action && (
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order.id, action.target)}
                    >
                      {isUpdating ? 'Actualizando...' : action.label}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
