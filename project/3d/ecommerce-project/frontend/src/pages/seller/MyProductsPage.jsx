'use client'
import { useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders } from '../../shared/lib/auth'
import './MyProductsPage.css'

function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function MyProductsPage({ initialData = {} }) {
  const [categories, setCategories] = useState(initialData.categories || [])
  const [myListings, setMyListings] = useState(initialData.listings || [])
  const [loading, setLoading] = useState(!initialData?.hydrated)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [dataWarning, setDataWarning] = useState('')
  const [publishError, setPublishError] = useState('')
  const [publishSuccess, setPublishSuccess] = useState('')
  const [imageError, setImageError] = useState('')
  const [imageSuccess, setImageSuccess] = useState('')
  const [savingImageFor, setSavingImageFor] = useState('')
  const [imageForms, setImageForms] = useState({})
  const [listingForm, setListingForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    price: '',
    stock: '0',
  })

  const hasMyListings = useMemo(() => myListings.length > 0, [myListings])

  const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Could not load categories')
    return await response.json()
  }

  const fetchMyListings = async () => {
    const response = await fetch(`${API_BASE_URL}/products/mine/listings`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Could not load your listings')
    return await response.json()
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    setDataWarning('')
    try {
      const [categoriesResult, listingsResult] = await Promise.allSettled([
        fetchCategories(),
        fetchMyListings(),
      ])

      const categoriesFailed = categoriesResult.status === 'rejected'
      const listingsFailed = listingsResult.status === 'rejected'

      if (categoriesResult.status === 'fulfilled') {
        setCategories(Array.isArray(categoriesResult.value) ? categoriesResult.value : [])
      } else {
        setCategories([])
      }

      if (listingsResult.status === 'fulfilled') {
        const listingsData = listingsResult.value
        setMyListings(Array.isArray(listingsData) ? listingsData : [])
      } else {
        setMyListings([])
      }

      if (categoriesFailed && listingsFailed) {
        setError('Seller panel data is temporarily unavailable.')
      } else if (categoriesFailed) {
        setDataWarning('Categories are temporarily unavailable. Listing creation may be limited.')
      } else if (listingsFailed) {
        setDataWarning('Your listings are temporarily unavailable. You can still use available seller tools.')
      }
    } catch (err) {
      setError(err.message || 'Could not load your seller panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData?.hydrated) {
      void loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleListingInput = (event) => {
    const { name, value } = event.target
    setListingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateListing = async (event) => {
    event.preventDefault()
    setPublishError('')
    setPublishSuccess('')
    setPublishing(true)

    try {
      const payload = {
        name: listingForm.name.trim(),
        slug: listingForm.slug.trim().toLowerCase(),
        category_id: listingForm.category_id,
        description: listingForm.description.trim() || null,
        price: Number(listingForm.price),
        stock: Number(listingForm.stock || 0),
      }

      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof data?.detail === 'string' ? data.detail : 'Could not publish product')
      }

      setPublishSuccess('Product published successfully.')
      setListingForm({
        name: '',
        slug: '',
        category_id: '',
        description: '',
        price: '',
        stock: '0',
      })
      const listingsData = await fetchMyListings()
      setMyListings(Array.isArray(listingsData) ? listingsData : [])
    } catch (err) {
      setPublishError(err.message || 'Could not publish product')
    } finally {
      setPublishing(false)
    }
  }

  const getImageForm = (productId) => {
    return imageForms[productId] || { image_url: '', alt_text: '', position: '0' }
  }

  const handleImageInput = (productId, event) => {
    const { name, value } = event.target
    setImageForms((prev) => ({
      ...prev,
      [productId]: {
        ...getImageForm(productId),
        [name]: value,
      },
    }))
  }

  const handleAddImage = async (event, productId) => {
    event.preventDefault()
    setImageError('')
    setImageSuccess('')
    setSavingImageFor(productId)

    try {
      const form = getImageForm(productId)
      const payload = {
        image_url: form.image_url.trim(),
        alt_text: form.alt_text.trim() || null,
        position: Number(form.position || 0),
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(typeof data?.detail === 'string' ? data.detail : 'Could not add image')
      }

      setImageSuccess('Image added to gallery.')
      setImageForms((prev) => ({
        ...prev,
        [productId]: { image_url: '', alt_text: '', position: '0' },
      }))
    } catch (err) {
      setImageError(err.message || 'Could not add image')
    } finally {
      setSavingImageFor('')
    }
  }

  return (
    <section className="seller-section">
      <div className="seller-header">
        <h2>My products</h2>
        <p>Manage your listings and keep your gallery updated.</p>
      </div>

      {loading && <p className="seller-state">Loading your products...</p>}
      {!loading && error && <p className="seller-error">{error}</p>}
      {!loading && !error && dataWarning && <p className="seller-warning">{dataWarning}</p>}

      {!loading && (
        <>
          <article className="seller-card">
            <h3>Create product</h3>
            {publishError && <p className="seller-error">{publishError}</p>}
            {publishSuccess && <p className="seller-success">{publishSuccess}</p>}

            <form className="seller-form" onSubmit={handleCreateListing}>
              <input
                name="name"
                placeholder="Product name"
                value={listingForm.name}
                onChange={handleListingInput}
                minLength={3}
                maxLength={255}
                required
              />
              <input
                name="slug"
                placeholder="slug-example"
                value={listingForm.slug}
                onChange={handleListingInput}
                minLength={3}
                maxLength={255}
                required
              />
              <select
                name="category_id"
                value={listingForm.category_id}
                onChange={handleListingInput}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                placeholder="Price"
                value={listingForm.price}
                onChange={handleListingInput}
                required
              />
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="Stock"
                value={listingForm.stock}
                onChange={handleListingInput}
                required
              />
              <input
                name="description"
                placeholder="Short description"
                value={listingForm.description}
                onChange={handleListingInput}
              />
              <button type="submit" disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish listing'}
              </button>
            </form>
          </article>

          <article className="seller-card">
            <h3>My listings</h3>
            {imageError && <p className="seller-error">{imageError}</p>}
            {imageSuccess && <p className="seller-success">{imageSuccess}</p>}
            {!hasMyListings && <p className="seller-state">You have not published products yet.</p>}
            {hasMyListings && (
              <div className="seller-grid">
                {myListings.map((product) => (
                  <article className="product-card" key={product.id}>
                    <h4>{product.name}</h4>
                    <p>{product.description || 'Product without description'}</p>
                    <div className="product-meta">
                      <span className="product-price">{formatPrice(product.price)}</span>
                      <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
                      </span>
                    </div>
                    <form className="listing-image-form" onSubmit={(event) => handleAddImage(event, product.id)}>
                      <input
                        name="image_url"
                        type="url"
                        placeholder="https://.../image.jpg"
                        value={getImageForm(product.id).image_url}
                        onChange={(event) => handleImageInput(product.id, event)}
                        required
                      />
                      <input
                        name="alt_text"
                        placeholder="Alt text"
                        value={getImageForm(product.id).alt_text}
                        onChange={(event) => handleImageInput(product.id, event)}
                      />
                      <input
                        name="position"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Position"
                        value={getImageForm(product.id).position}
                        onChange={(event) => handleImageInput(product.id, event)}
                      />
                      <button type="submit" disabled={savingImageFor === product.id}>
                        {savingImageFor === product.id ? 'Saving image...' : 'Add image'}
                      </button>
                    </form>
                  </article>
                ))}
              </div>
            )}
          </article>

        </>
      )}
    </section>
  )
}
