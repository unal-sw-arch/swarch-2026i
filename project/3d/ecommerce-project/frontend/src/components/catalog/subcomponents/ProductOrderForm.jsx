'use client'
/**
 * Product order form component with saga polling support.
 */
import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../../../shared/config/api'
import { fetchJsonWithAuth } from '../../../shared/utils/api'
import { getAuthHeaders } from '../../../shared/lib/auth'

const PENDING_STATUS = 'pending_stock_confirmation'
const TERMINAL_STATUSES = new Set(['confirmed', 'cancelled', 'pending', 'paid', 'shipped', 'delivered'])
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 60000

const initialOrderForm = {
  full_name: '',
  street: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  phone: '',
  notes: '',
}

export default function ProductOrderForm({ product }) {
  const [values, setValues] = useState(initialOrderForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pollingStatus, setPollingStatus] = useState('')

  const pollIntervalRef = useRef(null)
  const pollStartRef = useRef(null)

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    setPollingStatus('')
  }

  const startPolling = (orderId) => {
    pollStartRef.current = Date.now()
    setPollingStatus('Confirming stock availability…')

    pollIntervalRef.current = setInterval(async () => {
      try {
        const elapsed = Date.now() - pollStartRef.current
        if (elapsed > POLL_TIMEOUT_MS) {
          stopPolling()
          setSuccess(`Order #${String(orderId).slice(0, 8)} is still being processed. Check your orders page later.`)
          return
        }

        const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: getAuthHeaders(),
        })

        if (!res.ok) {
          stopPolling()
          return
        }

        const order = await res.json()
        const status = order?.status

        if (!status || !TERMINAL_STATUSES.has(status)) {
          return
        }

        stopPolling()

        if (status === 'confirmed' || status === 'pending' || status === 'paid') {
          setSuccess(`Order #${String(orderId).slice(0, 8)} confirmed successfully!`)
        } else if (status === 'cancelled') {
          setError(`Order #${String(orderId).slice(0, 8)} was cancelled — insufficient stock.`)
          setSuccess('')
        } else {
          setSuccess(`Order #${String(orderId).slice(0, 8)} status: ${status}.`)
        }
      } catch {
        // silently ignore transient fetch errors during polling
      }
    }, POLL_INTERVAL_MS)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    stopPolling()

    const quantityInput = e.target.querySelector('input[type="number"]')
    const quantity = Math.max(1, Number.parseInt(quantityInput?.value || '1', 10))

    const payload = {
      items: [{
        product_id: product.id,
        quantity,
        unit_price: product.price,
        product_name: product.name || null,
      }],
      shipping_address: {
        full_name: values.full_name.trim(),
        street: values.street.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        country: values.country.trim(),
        postal_code: values.postal_code.trim(),
        phone: values.phone.trim() || null,
      },
      notes: values.notes.trim() || null,
    }

    try {
      const response = await fetchJsonWithAuth(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setValues({ ...initialOrderForm })

      const orderId = response?.id
      const orderStatus = response?.status

      if (orderId && orderStatus === PENDING_STATUS) {
        setSuccess(`Order #${String(orderId).slice(0, 8)} submitted.`)
        startPolling(orderId)
      } else {
        setSuccess(`Order #${String(orderId || '').slice(0, 8)} was created successfully.`)
      }
    } catch (err) {
      setError(err?.message || 'Could not create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="detail-order-form" onSubmit={handleSubmit}>
      {error && <p className="detail-error">{error}</p>}
      {success && <p className="detail-success">{success}</p>}
      {pollingStatus && <p className="detail-info">{pollingStatus}</p>}

      <div className="detail-order-grid">
        <label>
          Quantity
          <input
            type="number"
            min="1"
            max={String(Math.max(1, product.stock || 1))}
            defaultValue="1"
            required
          />
        </label>

        <label>
          Full name
          <input
            name="full_name"
            value={values.full_name}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          Street
          <input
            name="street"
            value={values.street}
            onChange={handleChange}
            minLength={5}
            maxLength={200}
            required
          />
        </label>

        <label>
          City
          <input
            name="city"
            value={values.city}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          State
          <input
            name="state"
            value={values.state}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          Country
          <input
            name="country"
            value={values.country}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          Postal code
          <input
            name="postal_code"
            value={values.postal_code}
            onChange={handleChange}
            minLength={3}
            maxLength={20}
            required
          />
        </label>

        <label>
          Phone (optional)
          <input
            name="phone"
            value={values.phone}
            onChange={handleChange}
            maxLength={20}
          />
        </label>
      </div>

      <label>
        Notes (optional)
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          placeholder="Delivery references, preferences, or extra context"
        />
      </label>

      <button type="submit" disabled={loading || product.stock <= 0}>
        {loading ? 'Creating order...' : 'Create order'}
      </button>
    </form>
  )
}
