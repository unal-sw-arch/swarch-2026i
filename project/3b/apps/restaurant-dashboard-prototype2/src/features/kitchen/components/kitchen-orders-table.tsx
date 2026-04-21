import type { KitchenOrder } from "@/features/kitchen/types/kitchen.types";
import { formatDate } from "@/shared/lib/format-date";
import { KitchenStatusActions } from "./kitchen-status-actions";

type KitchenOrdersTableProps = {
  orders: KitchenOrder[];
};

export function KitchenOrdersTable({ orders }: KitchenOrdersTableProps) {
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.orderId}
          className="rounded border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Pedido {order.orderId}</p>
              <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
            </div>
            <KitchenStatusActions orderId={order.orderId} status={order.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
