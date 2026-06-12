import { formatPrice } from '../../../shared/utils/format'

export default function MyListings({ listings }) {
  if (listings.length === 0) {
    return (
      <article className="user-address-card">
        <h3>My products for sale</h3>
        <p className="user-panel-state">You do not have active listings yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>My products for sale</h3>
      <ul className="address-list">
        {listings.map((product) => (
          <li className="address-item" key={product.id}>
            <p>{product.name}</p>
            <p>Price: {formatPrice(product.price)}</p>
            <p>Stock: {product.stock}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
