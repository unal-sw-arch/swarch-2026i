import { formatPrice, formatDate } from '../../../shared/utils/format'

export default function SalesOnListings({ sales, productLabels, buyerLabels }) {
  if (sales.length === 0) {
    return (
      <article className="user-address-card">
        <h3>Sales on your listings</h3>
        <p className="user-panel-state">No one has purchased your products yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>Sales on your listings</h3>
      <ul className="address-list">
        {sales.map((sale) => (
          <li className="address-item" key={`${sale.order_id}-${sale.product_id}-${sale.created_at}`}>
            <p>Product: {sale.product_name || productLabels[String(sale.product_id)] || sale.product_id}</p>
            <p>Buyer: {buyerLabels[String(sale.buyer_user_id)] || sale.buyer_user_id}</p>
            <p>Quantity sold: {sale.quantity}</p>
            <p>Total paid: {formatPrice(sale.paid_amount)}</p>
            <p>Unit price: {formatPrice(sale.unit_price)}</p>
            <p>Order: #{String(sale.order_id).slice(0, 8)} - {sale.order_status}</p>
            <p>Date: {formatDate(sale.created_at)}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
