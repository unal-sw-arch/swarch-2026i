'use client'
import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders } from '../../shared/lib/auth'
import './OrdersPage.css'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending_stock_confirmation', label: 'Awaiting stock' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CANCELLABLE_STATUSES = new Set(['pending_stock_confirmation', 'confirmed', 'pending', 'paid'])

function formatCurrency(value) {
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(number)
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function shortId(value) {
  if (typeof value !== 'string') return String(value || '')
  return value.slice(0, 8)
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

function normalizeOrdersPayload(payload) {
  return {
    total: Number(payload?.total || 0),
    page: Number(payload?.page || 1),
    page_size: Number(payload?.page_size || 20),
    items: Array.isArray(payload?.items) ? payload.items : [],
  }
}

function formatShippingAddress(address) {
  if (!address || typeof address !== 'object') {
    return 'No shipping details available.'
  }

  const parts = [
    address.full_name,
    address.street,
    address.city,
    address.state,
    address.country,
    address.postal_code,
  ].filter(Boolean)

  return parts.length ? parts.join(' - ') : 'No shipping details available.'
}

export default function OrdersPage({ initialData = {} }) {
  const [orders, setOrders] = useState(Array.isArray(initialData.items) ? initialData.items : [])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(!initialData?.hydrated)
  const [refreshing, setRefreshing] = useState(false)
  const [resolvingSellers, setResolvingSellers] = useState(false)
  const [cancellingId, setCancellingId] = useState('')
  const [error, setError] = useState(initialData.error || '')
  const [success, setSuccess] = useState('')
  const [sellerLookupWarning, setSellerLookupWarning] = useState('')
  const [sellerLabelsByProductId, setSellerLabelsByProductId] = useState({})
  const [meta, setMeta] = useState({
    total: Number(initialData.total || 0),
    page: Number(initialData.page || 1),
    pageSize: Number(initialData.page_size || 20),
  })

  const hasOrders = useMemo(() => orders.length > 0, [orders])

  const fetchOrders = async (nextStatus = statusFilter, mode = 'loading') => {
    if (mode === 'loading') {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    setError('')
    setSuccess('')

    try {
      const url = new URL(`${API_BASE_URL}/orders/`)
      url.searchParams.set('page', '1')
      url.searchParams.set('page_size', String(meta.pageSize || 20))
      if (nextStatus) {
        url.searchParams.set('status', nextStatus)
      }

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(extractErrorDetail(payload, 'Could not load your orders'))
      }

      const normalized = normalizeOrdersPayload(payload)
      setOrders(normalized.items)
      setMeta({
        total: normalized.total,
        page: normalized.page,
        pageSize: normalized.page_size,
      })
    } catch (err) {
      setOrders([])
      setError(err.message || 'Could not load your orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const resolveUserLabel = async (userId) => {
    if (!userId) return ''

    try {
      const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: getAuthHeaders(),
      })
      const userData = await userResponse.json().catch(() => ({}))
      if (userResponse.ok) {
        return userData?.name || userData?.email || String(userId)
      }

      const authResponse = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        headers: getAuthHeaders(),
      })
      const authData = await authResponse.json().catch(() => ({}))
      if (authResponse.ok) {
        return authData?.email || String(userId)
      }

      return String(userId)
    } catch {
      return String(userId)
    }
  }

  const hydrateSellerLabels = async (ordersSnapshot) => {
    const productIds = [
      ...new Set(
        (ordersSnapshot || [])
          .flatMap((order) => (Array.isArray(order?.items) ? order.items : []))
          .map((item) => String(item?.product_id || ''))
          .filter(Boolean)
      ),
    ]

    const missingProductIds = productIds.filter((productId) => !sellerLabelsByProductId[productId])
    if (!missingProductIds.length) {
      return
    }

    setResolvingSellers(true)
    setSellerLookupWarning('')

    try {
      const sellerUpdates = {}
      const sellerUserCache = {}

      await Promise.all(
        missingProductIds.map(async (productId) => {
          try {
            const productResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
              headers: getAuthHeaders(),
            })
            const productData = await productResponse.json().catch(() => ({}))
            if (!productResponse.ok) {
              return
            }

            if (typeof productData?.seller_display_name === 'string' && productData.seller_display_name.trim()) {
              sellerUpdates[productId] = productData.seller_display_name.trim()
              return
            }

            const sellerUserId = String(productData?.seller_user_id || '').trim()
            if (!sellerUserId) {
              return
            }

            if (!sellerUserCache[sellerUserId]) {
              sellerUserCache[sellerUserId] = await resolveUserLabel(sellerUserId)
            }

            sellerUpdates[productId] = sellerUserCache[sellerUserId]
          } catch {
            // Continue resolving remaining product sellers.
          }
        })
      )

      if (Object.keys(sellerUpdates).length) {
        setSellerLabelsByProductId((prev) => ({
          ...prev,
          ...sellerUpdates,
        }))
      }

      if (Object.keys(sellerUpdates).length < missingProductIds.length) {
        setSellerLookupWarning('Some seller names could not be resolved right now.')
      }
    } catch {
      setSellerLookupWarning('Some seller names could not be resolved right now.')
    } finally {
      setResolvingSellers(false)
    }
  }

  useEffect(() => {
    if (!initialData?.hydrated) {
      void fetchOrders('', 'loading')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void hydrateSellerLabels(orders)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders])

  const handleFilterChange = (event) => {
    const nextStatus = event.target.value
    setStatusFilter(nextStatus)
    void fetchOrders(nextStatus, 'loading')
  }

  const handleRefresh = () => {
    void fetchOrders(statusFilter, 'refresh')
  }

  const handleCancelOrder = async (orderId) => {
    if (!orderId || cancellingId) {
      return
    }

    setCancellingId(orderId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(extractErrorDetail(payload, 'Could not cancel this order'))
      }

      setOrders((prev) => prev.map((order) => (order.id === orderId ? payload : order)))
      setSuccess(`Order ${shortId(orderId)} was cancelled successfully.`)
    } catch (err) {
      setError(err.message || 'Could not cancel this order')
    } finally {
      setCancellingId('')
    }
  }

  return (
    <section className="orders-section" aria-label="Orders">
      <div className="orders-header">
        <div>
          <h2>My orders</h2>
          <p className="orders-subtitle">
            Track current statuses, inspect line items, and cancel pending purchases when needed.
          </p>
        </div>

        <button
          type="button"
          className="orders-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing || Boolean(cancellingId)}
        >
          {loading || refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="orders-controls">
        <label className="orders-filter" htmlFor="orders-status-filter">
          Status
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={handleFilterChange}
            disabled={loading || refreshing}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p className="orders-meta">
          Showing {orders.length} of {meta.total} orders (page {meta.page})
        </p>
      </div>

      {loading && <p className="orders-state">Loading your orders...</p>}
      {!loading && error && <p className="orders-error">{error}</p>}
      {!loading && !error && success && <p className="orders-success">{success}</p>}
      {!loading && !error && sellerLookupWarning && <p className="orders-warning">{sellerLookupWarning}</p>}

      {!loading && !error && !hasOrders && (
        <p className="orders-state">No orders found for the selected filter.</p>
      )}

      {!loading && !error && hasOrders && (
        <div className="orders-grid">
          {orders.map((order) => {
            const status = String(order.status || '').toLowerCase()
            const canCancel = CANCELLABLE_STATUSES.has(status)
            const items = Array.isArray(order.items) ? order.items : []

            return (
              <article key={order.id} className="order-card">
                <header className="order-card-top">
                  <div>
                    <p className="order-card-id">Order #{shortId(order.id)}</p>
                    <p className="order-card-date">Created: {formatDate(order.created_at)}</p>
                  </div>

                  <div className="order-card-summary">
                    <span className={`order-status order-status--${status || 'unknown'}`}>
                      {status || 'unknown'}
                    </span>
                    <span className="order-total">{formatCurrency(order.total_amount)}</span>
                  </div>
                </header>

                <div className="order-address">
                  <p className="order-address-title">Shipping address</p>
                  <p>{formatShippingAddress(order.shipping_address)}</p>
                  {order?.shipping_address?.phone && <p>Phone: {order.shipping_address.phone}</p>}
                </div>

                {order.notes && (
                  <p className="order-notes">
                    <strong>Notes:</strong> {order.notes}
                  </p>
                )}

                <div className="order-items">
                  <p className="order-items-title">Items ({items.length})</p>
                  {items.length === 0 ? (
                    <p className="order-item-empty">No line items available.</p>
                  ) : (
                    <ul>
                      {items.map((item) => (
                        <li key={item.id}>
                          <div className="order-item-main">
                            <span>{item.product_name || shortId(item.product_id)}</span>
                            <span className="order-item-seller">
                              Seller: {sellerLabelsByProductId[String(item.product_id)] || (resolvingSellers ? 'Resolving seller...' : 'Seller unavailable')}
                            </span>
                          </div>
                          <span className="order-item-quantity">x{item.quantity}</span>
                          <span className="order-item-price">{formatCurrency(item.price)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <footer className="order-actions">
                  <button
                    type="button"
                    className="order-cancel"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={!canCancel || cancellingId === order.id}
                  >
                    {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
