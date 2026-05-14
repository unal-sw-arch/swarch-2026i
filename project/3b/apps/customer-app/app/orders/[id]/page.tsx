import Link from "next/link";
import { notFound } from "next/navigation";

import { OrdersRepository } from "@/lib/repositories/orders-repository";
import { requireCustomerSession } from "@/lib/session";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireCustomerSession();
  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    notFound();
  }

  const order = await OrdersRepository.getOrder(orderId);

  if (!order) {
    return (
      <div className="page-shell">
        <div className="panel section-card empty-state">
          Order not found or unavailable for the current customer.
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell stack">
      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h1>Order #{order.id}</h1>
            <p className="muted">
              Current status from the order service official source of truth.
            </p>
          </div>
          <Link className="button-secondary" href={`/orders/${order.id}/timeline`}>
            Open timeline
          </Link>
        </div>

        <div className="meta-grid">
          <div className="meta-card">
            <span className="muted">Status</span>
            <h3>{order.status}</h3>
          </div>
          <div className="meta-card">
            <span className="muted">Restaurant</span>
            <h3>#{order.restaurantId}</h3>
          </div>
          <div className="meta-card">
            <span className="muted">Total</span>
            <h3>${order.totalAmount.toLocaleString("en-US")}</h3>
          </div>
        </div>
      </section>

      <section className="panel section-card">
        <div className="page-heading" style={{ marginBottom: 12 }}>
          <div>
            <h2>Items snapshot</h2>
            <p className="muted">
              Product name and price are snapshots coming from the order service response.
            </p>
          </div>
        </div>

        <div className="stack">
          {order.items.map((item) => (
            <div className="cart-line" key={`${order.id}-${item.menuItemId}`}>
              <div className="stack" style={{ gap: 8 }}>
                <strong>{item.productName}</strong>
                <span className="muted">
                  Qty {item.quantity} · ${item.unitPrice.toLocaleString("en-US")} each
                </span>
              </div>
              <strong>${item.subtotal.toLocaleString("en-US")}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
