import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { OrderSummary } from "@/lib/types";

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <article className="card">
      <div className="stack">
        <div className="stat-row" style={{ justifyContent: "space-between" }}>
          <span className="chip">Order #{order.id}</span>
          <span className="chip chip--success">{order.status}</span>
        </div>
        <div>
          <h3 className="card__title">Restaurant #{order.restaurantId}</h3>
          <p className="card__muted">
            Official order status and totals come from the order service.
          </p>
        </div>
        <strong className="badge-price">
          ${order.totalAmount.toLocaleString("en-US")}
        </strong>
        <div className="stat-row">
          <Link className="button-secondary" href={`/orders/${order.id}`}>
            View details
            <ArrowRight size={16} />
          </Link>
          <Link className="button-ghost" href={`/orders/${order.id}/timeline`}>
            Timeline
          </Link>
        </div>
      </div>
    </article>
  );
}
