export default function ReviewsReceived({ reviews, productLabels, reviewerLabels }) {
  if (reviews.length === 0) {
    return (
      <article className="user-address-card">
        <h3>Reviews on your listings</h3>
        <p className="user-panel-state">No reviews received on your products yet.</p>
      </article>
    )
  }

  return (
    <article className="user-address-card">
      <h3>Reviews on your listings</h3>
      <ul className="address-list">
        {reviews.map((review) => (
          <li className="address-item" key={review.id}>
            <p>Product: {productLabels[String(review.product_id)] || review.product_id}</p>
            <p>From user: {reviewerLabels[String(review.reviewer_user_id)] || review.reviewer_user_id}</p>
            <p>Rating: {'★'.repeat(review.rating)} ({review.rating}/5)</p>
            <p>{review.comment || 'No comment provided.'}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}
