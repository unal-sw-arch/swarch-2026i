import { OrderCard } from "@/components/order-card";
import { OrdersRepository } from "@/lib/repositories/orders-repository";
import { requireCustomerSession } from "@/lib/session";

export default async function OrdersPage() {
  await requireCustomerSession();
  const orders = await OrdersRepository.getMyOrders();

  return (
    <div className="page-shell">
      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h1>My orders</h1>
            <p className="muted">
              Official customer order list .
            </p>
          </div>
        </div>

        {orders.items.length === 0 ? (
          <div className="empty-state">
            You do not have any orders yet. Place one from a restaurant menu.
          </div>
        ) : (
          <div className="grid grid--cards">
            {orders.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
