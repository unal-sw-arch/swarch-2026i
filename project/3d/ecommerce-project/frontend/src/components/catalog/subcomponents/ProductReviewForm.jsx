/**
 * Product review submission form
 */
import { API_BASE_URL } from '../../../shared/config/api'
import { fetchJsonWithAuth } from '../../../shared/utils/api'
import { useFormHandler } from '../../../shared/hooks/useFormHandler'

export default function ProductReviewForm({ productId, onSubmitSuccess }) {
  const { values, loading, error, success, handleChange, handleSubmit, setValues, setError, setSuccess } = useFormHandler(
    { rating: '5', comment: '' },
    async (formValues) => {
      const response = await fetchJsonWithAuth(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: Number(formValues.rating),
          comment: formValues.comment.trim() || null,
        }),
      })

      await onSubmitSuccess()
      setValues({ rating: '5', comment: '' })

      return { message: 'Review saved successfully.' }
    }
  )

  return (
    <form className="detail-review-form" onSubmit={handleSubmit}>
      {error && <p className="detail-error">{error}</p>}
      {success && <p className="detail-success">{success}</p>}

      <label>
        Rating
        <select name="rating" value={values.rating} onChange={handleChange}>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>

      <label>
        Comment
        <textarea
          name="comment"
          value={values.comment}
          onChange={handleChange}
          rows={4}
          maxLength={1200}
          placeholder="Tell others about your experience with this product"
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving review...' : 'Publish review'}
      </button>
    </form>
  )
}
