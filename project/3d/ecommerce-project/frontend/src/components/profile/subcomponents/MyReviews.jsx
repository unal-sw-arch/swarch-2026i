export default function MyReviews({ reviews, productLabels }) {
  if (reviews.length === 0) {
    return (
      <article className="user-address-card">
        <h3>Reviews written by you</h3>
        <p className="user-panel-state">You have not reviewed products yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>Reviews written by you</h3>
      <ul className="address-list">
        {reviews.map((review) => (
          <li className="address-item" key={review.id}>
            <p>Product: {productLabels[String(review.product_id)] || review.product_id}</p>
            <p>Rating: {'★'.repeat(review.rating)} ({review.rating}/5)</p>
            <p>{review.comment || 'No comment provided.'}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
