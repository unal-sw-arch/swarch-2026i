'use client'
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders } from '../../shared/lib/auth'
import './UserProfilePage.css'

function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function createEmptyAddress() {
  return {
    address_line: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    is_default: false,
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string' ? data.detail : `Request failed (${response.status})`
    )
    error.status = response.status
    throw error
  }

  return data
}

export default function UserProfilePage({ initialData = {} }) {
  const [profile, setProfile] = useState(initialData.userProfile || null)
  const [addresses, setAddresses] = useState(initialData.addresses || [])
  const [myListings, setMyListings] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [reviewsReceived, setReviewsReceived] = useState([])
  const [salesOnMyProducts, setSalesOnMyProducts] = useState([])
  const [productLabels, setProductLabels] = useState({})
  const [reviewerLabels, setReviewerLabels] = useState({})
  const [buyerLabels, setBuyerLabels] = useState({})
  const [profileForm, setProfileForm] = useState({
    name: initialData.userProfile?.name || '',
    phone: initialData.userProfile?.phone || '',
  })
  const [addressForm, setAddressForm] = useState(createEmptyAddress())

  const [loading, setLoading] = useState(!initialData?.hydrated)
  const [productSectionLoading, setProductSectionLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)

  const [error, setError] = useState(initialData.error || '')
  const [productDataWarning, setProductDataWarning] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [addressError, setAddressError] = useState('')
  const [addressSuccess, setAddressSuccess] = useState('')

  const loadProductData = async () => {
    setProductSectionLoading(true)
    setProductDataWarning('')
    setMyListings([])
    setMyReviews([])
    setReviewsReceived([])
    setSalesOnMyProducts([])
    setProductLabels({})
    setReviewerLabels({})
    setBuyerLabels({})

    try {
      const productCalls = await Promise.allSettled([
        fetchJson(`${API_BASE_URL}/products/mine/reviews`, {
          headers: getAuthHeaders(),
        }),
        fetchJson(`${API_BASE_URL}/products/mine/reviews-received`, {
          headers: getAuthHeaders(),
        }),
        fetchJson(`${API_BASE_URL}/products/mine/listings`, {
          headers: getAuthHeaders(),
        }),
        fetchJson(`${API_BASE_URL}/orders/sales/mine?page=1&page_size=50`, {
          headers: getAuthHeaders(),
        }),
      ])

      const authoredReviews = productCalls[0].status === 'fulfilled' ? productCalls[0].value : []
      const sellerReviews = productCalls[1].status === 'fulfilled' ? productCalls[1].value : []
      const listings = productCalls[2].status === 'fulfilled' ? productCalls[2].value : []
      const salesResult = productCalls[3].status === 'fulfilled' ? productCalls[3].value : {}

      const hasProductFailures = productCalls.slice(0, 3).some((call) => call.status === 'rejected')
      const hasSalesFailures = productCalls[3].status === 'rejected'

      if (hasProductFailures && hasSalesFailures) {
        setProductDataWarning('Product and sales data are temporarily unavailable. Profile data remains available.')
      } else if (hasProductFailures) {
        setProductDataWarning('Product service is unavailable. Profile data remains available, but listing/review sections may be incomplete.')
      } else if (hasSalesFailures) {
        setProductDataWarning('Sales information is temporarily unavailable right now.')
      }

      const safeListings = Array.isArray(listings) ? listings : []
      const safeMyReviews = Array.isArray(authoredReviews) ? authoredReviews : []
      const safeSellerReviews = Array.isArray(sellerReviews) ? sellerReviews : []
      const safeSales = Array.isArray(salesResult?.items) ? salesResult.items : []

      setMyListings(safeListings)
      setMyReviews(safeMyReviews)
      setReviewsReceived(safeSellerReviews)
      setSalesOnMyProducts(safeSales)

      const listingLabelMap = Object.fromEntries(
        safeListings.map((product) => [String(product.id), product.name || String(product.id)])
      )
      const reviewedProductIds = [
        ...new Set(
          [...safeMyReviews, ...safeSellerReviews].map((review) => String(review.product_id))
        ),
      ]
      const missingProductIds = reviewedProductIds.filter((id) => !listingLabelMap[id])

      const fetchedProductLabels = await Promise.allSettled(
        missingProductIds.map(async (id) => {
          const productResponse = await fetchJson(`${API_BASE_URL}/products/${id}`, {
            headers: getAuthHeaders(),
          })
          return [id, productResponse?.name || id]
        })
      )

      const productEntries = fetchedProductLabels
        .filter((entry) => entry.status === 'fulfilled')
        .map((entry) => entry.value)

      if (!hasProductFailures && fetchedProductLabels.some((entry) => entry.status === 'rejected')) {
        setProductDataWarning('Some product labels could not be loaded at this moment.')
      }

      setProductLabels({
        ...listingLabelMap,
        ...Object.fromEntries(productEntries),
      })

      const reviewerIds = [...new Set(safeSellerReviews.map((review) => String(review.reviewer_user_id)))]
      const reviewerEntries = await Promise.all(reviewerIds.map(async (id) => {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: getAuthHeaders(),
          })
          const userData = await userResponse.json().catch(() => ({}))
          if (userResponse.ok) {
            return [id, userData?.name || userData?.email || id]
          }

          const authResponse = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
            headers: getAuthHeaders(),
          })
          const authData = await authResponse.json().catch(() => ({}))
          if (authResponse.ok) {
            return [id, authData?.email || id]
          }

          return [id, id]
        } catch {
          return [id, id]
        }
      }))
      setReviewerLabels(Object.fromEntries(reviewerEntries))

      const buyerIds = [...new Set(safeSales.map((sale) => String(sale.buyer_user_id)).filter(Boolean))]
      const buyerEntries = await Promise.all(buyerIds.map(async (id) => {
        try {
          const userResponse = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: getAuthHeaders(),
          })
          const userData = await userResponse.json().catch(() => ({}))
          if (userResponse.ok) {
            return [id, userData?.name || userData?.email || id]
          }

          const authResponse = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
            headers: getAuthHeaders(),
          })
          const authData = await authResponse.json().catch(() => ({}))
          if (authResponse.ok) {
            return [id, authData?.email || id]
          }

          return [id, id]
        } catch {
          return [id, id]
        }
      }))
      setBuyerLabels(Object.fromEntries(buyerEntries))
    } catch {
      setProductDataWarning('Product information is temporarily unavailable.')
    } finally {
      setProductSectionLoading(false)
    }
  }

  const loadUserData = async () => {
    setLoading(true)
    setError('')
    setProductDataWarning('')

    try {
      const authUser = await fetchJson(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      })

      const userProfile = await fetchJson(
        `${API_BASE_URL}/users/by-email?email=${encodeURIComponent(authUser.email)}`,
        {
          headers: getAuthHeaders(),
        }
      )

      const userAddresses = await fetchJson(`${API_BASE_URL}/users/${userProfile.id}/addresses`, {
        headers: getAuthHeaders(),
      })

      setProfile(userProfile)
      setProfileForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
      })
      setAddresses(Array.isArray(userAddresses) ? userAddresses : [])
      void loadProductData()
    } catch (err) {
      if (err.status === 404) {
        setError('No user profile was found in user-service for this account yet.')
      } else {
        setError(err.message || 'Could not load your user profile')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialData?.hydrated) {
      if (initialData?.userProfile) {
        void loadProductData()
      }
      return
    }

    void loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProfileInput = (event) => {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressInput = (event) => {
    const { name, value, type, checked } = event.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    if (!profile?.id) {
      return
    }

    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
      }

      const updatedProfile = await fetchJson(`${API_BASE_URL}/users/${profile.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      setProfile(updatedProfile)
      setProfileForm({
        name: updatedProfile.name || '',
        phone: updatedProfile.phone || '',
      })
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(err.message || 'Could not update your profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAddressSubmit = async (event) => {
    event.preventDefault()

    if (!profile?.id) {
      return
    }

    setAddressSaving(true)
    setAddressError('')
    setAddressSuccess('')

    try {
      await fetchJson(`${API_BASE_URL}/users/${profile.id}/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressForm),
      })

      const userAddresses = await fetchJson(`${API_BASE_URL}/users/${profile.id}/addresses`, {
        headers: getAuthHeaders(),
      })

      setAddresses(Array.isArray(userAddresses) ? userAddresses : [])
      setAddressForm(createEmptyAddress())
      setAddressSuccess('Address added successfully.')
    } catch (err) {
      setAddressError(err.message || 'Could not save the address')
    } finally {
      setAddressSaving(false)
    }
  }

  return (
    <section className="user-panel-section" aria-label="User profile">
      <div className="user-panel-header">
        <div>
          <h2>My profile</h2>
          <p className="user-panel-subtitle">
            View and edit your personal data in a dedicated profile section.
          </p>
        </div>
        <button
          className="user-refresh-button"
          type="button"
          onClick={loadUserData}
          disabled={loading || productSectionLoading || profileSaving || addressSaving}
        >
          {loading || productSectionLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <p className="user-panel-state">Loading user profile...</p>}
      {!loading && error && <p className="user-panel-error">{error}</p>}

      {!loading && !error && profile && (
        <div className="user-panel-grid">
          <article className="user-profile-card identity-card">
            <div className="identity-top">
              <div className="avatar-pill">{(profile.name || profile.email).slice(0, 1).toUpperCase()}</div>
              <div>
                <h3>{profile.name}</h3>
                <p>{profile.email}</p>
              </div>
            </div>

            <div className="user-profile-item">
              <span className="item-label">Role</span>
              <span className="user-role-chip">{profile.role || 'customer'}</span>
            </div>

            <div className="user-profile-item">
              <span className="item-label">Phone</span>
              <span className="item-value">{profile.phone || 'Not configured yet'}</span>
            </div>
          </article>

          <article className="user-profile-card edit-card">
            <h3>Edit profile</h3>

            {profileError && <p className="user-panel-error">{profileError}</p>}
            {profileSuccess && <p className="user-panel-success">{profileSuccess}</p>}

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <label>
                Full name
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileInput}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileInput}
                  placeholder="Optional"
                  maxLength={40}
                />
              </label>

              <button type="submit" disabled={profileSaving}>
                {profileSaving ? 'Saving profile...' : 'Save profile'}
              </button>
            </form>
          </article>

          <div className="user-address-grid">
            <article className="user-address-card">
              <h3>Saved addresses</h3>

              {addresses.length === 0 ? (
                <p className="user-panel-state">You do not have saved addresses yet.</p>
              ) : (
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
              )}
            </article>

            <article className="user-address-card">
              <h3>Add address</h3>

              {addressError && <p className="user-panel-error">{addressError}</p>}
              {addressSuccess && <p className="user-panel-success">{addressSuccess}</p>}

              <form className="address-form" onSubmit={handleAddressSubmit}>
                <input
                  name="address_line"
                  placeholder="Address line"
                  value={addressForm.address_line}
                  onChange={handleAddressInput}
                  required
                />
                <input
                  name="city"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={handleAddressInput}
                  required
                />
                <input
                  name="state"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={handleAddressInput}
                  required
                />
                <input
                  name="country"
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={handleAddressInput}
                  required
                />
                <input
                  name="postal_code"
                  placeholder="Postal code"
                  value={addressForm.postal_code}
                  onChange={handleAddressInput}
                  required
                  minLength={3}
                  maxLength={20}
                />

                <label className="checkbox-line">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={handleAddressInput}
                  />
                  Set as default address
                </label>

                <button type="submit" disabled={addressSaving}>
                  {addressSaving ? 'Saving address...' : 'Save address'}
                </button>
              </form>
            </article>
          </div>

          <div className="user-reviews-grid">
            {productSectionLoading && <p className="user-panel-state">Loading product activity...</p>}
            {productDataWarning && <p className="user-panel-warning">{productDataWarning}</p>}

            <article className="user-address-card">
              <h3>My products for sale</h3>
              {myListings.length === 0 ? (
                <p className="user-panel-state">You do not have active listings yet.</p>
              ) : (
                <ul className="address-list">
                  {myListings.map((product) => (
                    <li className="address-item" key={product.id}>
                      <p>{product.name}</p>
                      <p>Price: {formatPrice(product.price)}</p>
                      <p>Stock: {product.stock}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="user-address-card">
              <h3>Sales on your listings</h3>
              {salesOnMyProducts.length === 0 ? (
                <p className="user-panel-state">No one has purchased your products yet.</p>
              ) : (
                <ul className="address-list">
                  {salesOnMyProducts.map((sale) => (
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
              )}
            </article>

            <article className="user-address-card">
              <h3>Reviews written by you</h3>
              {myReviews.length === 0 ? (
                <p className="user-panel-state">You have not reviewed products yet.</p>
              ) : (
                <ul className="address-list">
                  {myReviews.map((review) => (
                    <li className="address-item" key={review.id}>
                      <p>Product: {productLabels[String(review.product_id)] || review.product_id}</p>
                      <p>Rating: {'★'.repeat(review.rating)} ({review.rating}/5)</p>
                      <p>{review.comment || 'No comment provided.'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="user-address-card">
              <h3>Reviews on your listings</h3>
              {reviewsReceived.length === 0 ? (
                <p className="user-panel-state">No reviews received on your products yet.</p>
              ) : (
                <ul className="address-list">
                  {reviewsReceived.map((review) => (
                    <li className="address-item" key={review.id}>
                      <p>Product: {productLabels[String(review.product_id)] || review.product_id}</p>
                      <p>From user: {reviewerLabels[String(review.reviewer_user_id)] || review.reviewer_user_id}</p>
                      <p>Rating: {'★'.repeat(review.rating)} ({review.rating}/5)</p>
                      <p>{review.comment || 'No comment provided.'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </div>
      )}
    </section>
  )
}