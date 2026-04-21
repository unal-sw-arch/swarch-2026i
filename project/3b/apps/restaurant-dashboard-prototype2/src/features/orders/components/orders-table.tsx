import type { RestaurantOrderSummary } from "@/features/orders/types/orders.types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/format-date";
import { OrderStatusBadge } from "./order-status-badge";

type OrdersTableProps = {
  orders: RestaurantOrderSummary[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-3 py-2">Order ID</th>
            <th className="px-3 py-2">Customer ID</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Total Amount</th>
            <th className="px-3 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-200/80">
              <td className="px-3 py-2">{order.id}</td>
              <td className="px-3 py-2">{order.customerId}</td>
              <td className="px-3 py-2">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-3 py-2">{formatCurrency(order.totalAmount)}</td>
              <td className="px-3 py-2">{order.createdAt ? formatDate(order.createdAt) : "Fecha no disponible"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
