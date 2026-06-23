import { formatPrice, formatDate } from '../../../shared/utils/format'

export default function MyPurchases({ paidOrders }) {
  if (!paidOrders || paidOrders.length === 0) {
    return (
      <article className="user-address-card">
        <h3>My purchases</h3>
        <p className="user-panel-state">You have no completed purchases yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>My purchases</h3>
      <ul className="address-list">
        {paidOrders.map((order) => {
          const items = Array.isArray(order.items) ? order.items : []
          return (
            <li className="address-item" key={order.id}>
              <p><strong>Order #{String(order.id).slice(0, 8)}</strong> — {formatDate(order.created_at)}</p>
              <p>Total: {formatPrice(order.total_amount)}</p>
              {items.length > 0 && (
                <ul style={{ marginTop: '6px', paddingLeft: '12px' }}>
                  {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: '4px' }}>
                      {item.product_name || `Product ${String(item.product_id).slice(0, 8)}`}
                      {' · '}x{item.quantity}
                      {' · '}
                      {formatPrice(item.price)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </article>
  )
}
