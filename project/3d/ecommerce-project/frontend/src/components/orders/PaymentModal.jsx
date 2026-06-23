'use client'
import { useState } from 'react'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders } from '../../shared/lib/auth'
import { fetchWithGatewayRetry } from '../../shared/lib/http'
import './PaymentModal.css'

function formatCurrency(value) {
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number)
}

function extractErrorDetail(data, fallback) {
  if (typeof data?.detail === 'string' && data.detail.trim()) {
    return data.detail
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const firstMessage = data.detail[0]?.msg
    if (typeof firstMessage === 'string' && firstMessage.trim()) {
      return firstMessage
    }
  }

  return fallback
}

const FAILURE_MESSAGES = {
  card_declined: 'The card was declined by the payment gateway.',
}

export default function PaymentModal({ order, onClose, onPaid }) {
  const [method, setMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [failure, setFailure] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError('')
    setFailure('')

    try {
      const body = { method }
      if (method === 'card') {
        body.card_number = cardNumber.replace(/\s+/g, '')
        body.card_holder = cardHolder.trim() || undefined
        body.card_expiry = cardExpiry.trim() || undefined
      }

      const response = await fetchWithGatewayRetry(`${API_BASE_URL}/orders/${order.id}/pay`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(extractErrorDetail(payload, 'Could not process the payment'))
      }

      if (payload.status === 'completed') {
        onPaid(payload)
        return
      }

      setFailure(FAILURE_MESSAGES[payload.failure_reason] || 'The payment was rejected. Try another method.')
    } catch (err) {
      setError(err.message || 'Could not process the payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="payment-overlay" role="dialog" aria-modal="true" aria-label="Pay order">
      <div className="payment-modal">
        <header className="payment-header">
          <div>
            <h3>Pay order</h3>
            <p className="payment-amount">Total: {formatCurrency(order.total_amount)}</p>
          </div>
          <button type="button" className="payment-close" onClick={onClose} disabled={submitting}>
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} className="payment-form">
          <label className="payment-field" htmlFor="payment-method">
            Payment method
            <select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              disabled={submitting}
            >
              <option value="card">Credit / debit card</option>
              <option value="transfer">Bank transfer</option>
            </select>
          </label>

          {method === 'card' && (
            <>
              <label className="payment-field" htmlFor="payment-card-number">
                Card number
                <input
                  id="payment-card-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4111 1111 1111 1111"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  required
                  disabled={submitting}
                />
              </label>

              <div className="payment-row">
                <label className="payment-field" htmlFor="payment-card-holder">
                  Card holder
                  <input
                    id="payment-card-holder"
                    type="text"
                    placeholder="Name on card"
                    value={cardHolder}
                    onChange={(event) => setCardHolder(event.target.value)}
                    disabled={submitting}
                  />
                </label>

                <label className="payment-field" htmlFor="payment-card-expiry">
                  Expiry (MM/YY)
                  <input
                    id="payment-card-expiry"
                    type="text"
                    placeholder="12/27"
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value)}
                    disabled={submitting}
                  />
                </label>
              </div>

              <p className="payment-hint">
                Simulated gateway: cards ending in <strong>0000</strong> are declined (for testing).
              </p>
            </>
          )}

          {method === 'transfer' && (
            <p className="payment-hint">Simulated bank transfer — completes immediately.</p>
          )}

          {error && <p className="payment-error">{error}</p>}
          {failure && <p className="payment-error">{failure} You can retry with different details.</p>}

          <footer className="payment-actions">
            <button type="button" className="payment-cancel" onClick={onClose} disabled={submitting}>
              Close
            </button>
            <button type="submit" className="payment-submit" disabled={submitting}>
              {submitting ? 'Processing…' : `Pay ${formatCurrency(order.total_amount)}`}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
