import { useEffect, useMemo, useState } from 'react'
import './ProductCatalog.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductCatalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasProducts = useMemo(() => products.length > 0, [products])

  const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/products/categories`)
    if (!response.ok) throw new Error('Could not load categories')
    const data = await response.json()
    setCategories(data)
  }

  const fetchProducts = async (categorySlug = '') => {
    const url = new URL(`${API_BASE_URL}/products/`)
    if (categorySlug) {
      url.searchParams.set('category_slug', categorySlug)
    }

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Could not load products')
    const data = await response.json()
    setProducts(data)
  }

  const searchProducts = async (query) => {
    const url = new URL(`${API_BASE_URL}/products/search`)
    url.searchParams.set('q', query)

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Search request failed')
    const data = await response.json()
    setProducts(data)
  }

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([fetchCategories(), fetchProducts(selectedCategory)])
    } catch (err) {
      setError(err.message || 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCategoryChange = async (event) => {
    const categorySlug = event.target.value
    setSelectedCategory(categorySlug)
    setSearchText('')
    setLoading(true)
    setError('')

    try {
      await fetchProducts(categorySlug)
    } catch (err) {
      setError(err.message || 'Error filtering products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault()

    const query = searchText.trim()
    setLoading(true)
    setError('')

    try {
      if (!query) {
        await fetchProducts(selectedCategory)
      } else {
        await searchProducts(query)
      }
    } catch (err) {
      setError(err.message || 'Error searching products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <h2>Product Catalog</h2>
      </div>

      <div className="catalog-controls">
        <form className="catalog-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search by name or description"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            Search
          </button>
        </form>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={loading}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="catalog-state">Loading products...</p>}
      {error && <p className="catalog-error">{error}</p>}
      {!loading && !error && !hasProducts && (
        <p className="catalog-state">No products to display.</p>
      )}

      {!loading && !error && hasProducts && (
        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <h3>{product.name}</h3>
              <p className="product-description">
                {product.description || 'Product without description'}
              </p>
              <div className="product-meta">
                <span className="product-price">{formatPrice(product.price)}</span>
                <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}