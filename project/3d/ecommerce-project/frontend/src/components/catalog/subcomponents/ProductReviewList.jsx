/**
 * Product reviews list component
 */

function Stars({ rating }) {
  return <span>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export default function ProductReviewList({ reviews, reviewerLabels }) {
  if (reviews.length === 0) {
    return <p className="detail-state">This product has no reviews yet.</p>
  }

  return (
    <ul className="detail-reviews-list">
      {reviews.map((review) => (
        <li className="detail-review-item" key={review.id}>
          <p>
            <Stars rating={review.rating} /> ({review.rating}/5)
          </p>
          <p>{review.comment || 'No comment provided.'}</p>
          <p className="detail-muted">By: {reviewerLabels[review.reviewer_user_id] || review.reviewer_user_id}</p>
        </li>
      ))}
    </ul>
  )
}
