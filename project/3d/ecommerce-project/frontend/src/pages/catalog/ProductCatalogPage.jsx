'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '../../shared/config/api'
import { getAuthHeaders } from '../../shared/lib/auth'
import './ProductCatalogPage.css'

function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductCatalogPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const hasProducts = useMemo(() => products.length > 0, [products])

  const fetchCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Could not load categories')
    return await response.json()
  }

  const fetchProducts = async (categorySlug = '') => {
    const url = new URL(`${API_BASE_URL}/products/`)
    if (categorySlug) {
      url.searchParams.set('category_slug', categorySlug)
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Could not load products')
    return await response.json()
  }

  const searchProducts = async (query) => {
    const url = new URL(`${API_BASE_URL}/products/search`)
    url.searchParams.set('q', query)
    
    // Agregar categoría a la búsqueda si está seleccionada
    if (selectedCategory) {
      url.searchParams.set('category_slug', selectedCategory)
    }

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Search request failed')
    return await response.json()
  }

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    setWarning('')
    try {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        fetchCategories(),
        fetchProducts(selectedCategory),
      ])

      if (categoriesResult.status === 'fulfilled') {
        setCategories(Array.isArray(categoriesResult.value) ? categoriesResult.value : [])
      } else {
        setCategories([])
        setWarning('Categories are temporarily unavailable. You can still browse products.')
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(Array.isArray(productsResult.value) ? productsResult.value : [])
      } else {
        setProducts([])
        throw new Error('Could not load products')
      }
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
    setWarning('')

    try {
      const data = await fetchProducts(categorySlug)
      setProducts(Array.isArray(data) ? data : [])
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
    setWarning('')

    try {
      if (!query) {
        const data = await fetchProducts(selectedCategory)
        setProducts(Array.isArray(data) ? data : [])
      } else {
        const data = await searchProducts(query)
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      setError(err.message || 'Error searching products')
    } finally {
      setLoading(false)
    }
  }

  const openProductDetail = (productId) => {
    router.push(`/dashboard/products/${productId}`)
  }

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <h2>Product Catalog</h2>
        <p className="catalog-subtitle">Discover products and open each listing in detail.</p>
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
      {!error && warning && <p className="catalog-warning">{warning}</p>}
      {!loading && !error && !hasProducts && (
        <p className="catalog-state">No products to display.</p>
      )}

      {!loading && !error && hasProducts && (
        <div className="products-grid">
          {products.map((product) => (
            <article
              className="product-card clickable"
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => openProductDetail(product.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openProductDetail(product.id)
                }
              }}
            >
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
              <button
                type="button"
                className="detail-button"
                onClick={(event) => {
                  event.stopPropagation()
                  openProductDetail(product.id)
                }}
              >
                View details
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}