export default function AddressList({ addresses }) {
  if (addresses.length === 0) {
    return (
      <article className="user-address-card">
        <h3>Saved addresses</h3>
        <p className="user-panel-state">You do not have saved addresses yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>Saved addresses</h3>
      <ul className="address-list">
        {addresses.map((address) => (
          <li key={address.id} className="address-item">
            <p>{address.address_line}</p>
            <p>
              {address.city}, {address.state}, {address.country}
            </p>
            <p>Postal code: {address.postal_code}</p>
            {address.is_default && <span className="default-pill">Default</span>}
          </li>
        ))}
      </ul>
    </article>
  )
}
