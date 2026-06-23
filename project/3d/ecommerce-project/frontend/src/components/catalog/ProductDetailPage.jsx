'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '../../shared/utils/format'
import { useProductDetail } from '../../shared/hooks/useProductDetail'
import ProductGallery from './subcomponents/ProductGallery'
import ProductReviewList from './subcomponents/ProductReviewList'
import ProductReviewForm from './subcomponents/ProductReviewForm'
import ProductOrderForm from './subcomponents/ProductOrderForm'
import './ProductDetailPage.css'

export default function ProductDetailPage({ productId, initialData = {} }) {
  const router = useRouter()
  const { product, categoryName, sellerName, images, reviews, reviewerLabels, loading, error, warning, refresh } =
    useProductDetail(productId, initialData)

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((acc, item) => acc + Number(item.rating || 0), 0)
    return total / reviews.length
  }, [reviews])

  if (loading) {
    return (
      <section className="product-detail-section">
        <p className="detail-state">Loading product detail...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="product-detail-section">
        <button type="button" className="detail-back" onClick={() => router.push('/dashboard/products')}>
          Back to catalog
        </button>
        <p className="detail-error">{error}</p>
      </section>
    )
  }

  if (!product) {
    return null
  }

  return (
    <section className="product-detail-section">
      <button type="button" className="detail-back" onClick={() => router.push('/dashboard/products')}>
        Back to catalog
      </button>

      {warning && <p className="detail-warning">{warning}</p>}

      <article className="detail-card">
        <div className="detail-main">
          <p className="detail-kicker">Product detail</p>
          <h2>{product.name}</h2>
          <p className="detail-description">{product.description || 'No detailed description provided.'}</p>

          <div className="detail-specs">
            <p>
              <strong>Price:</strong> {formatPrice(product.price)}
            </p>
            <p>
              <strong>Stock:</strong> {product.stock}
            </p>
            <p>
              <strong>Category:</strong> {categoryName}
            </p>
            <p>
              <strong>Seller:</strong> {sellerName}
            </p>
            <p>
              <strong>Slug:</strong> {product.slug}
            </p>
          </div>
        </div>

        <aside className="detail-summary">
          <h3>Rating summary</h3>
          <p className="detail-average">{averageRating.toFixed(1)} / 5</p>
          <p>{reviews.length} review(s)</p>
        </aside>
      </article>

      <article className="detail-card detail-order-card">
        <h3>Buy now</h3>
        <p className="detail-muted">Create an order for this product through order-service.</p>

        {product.stock <= 0 && (
          <p className="detail-warning">This item is currently out of stock and cannot be ordered.</p>
        )}

        <ProductOrderForm product={product} />
      </article>

      <article className="detail-card">
        <h3>Image gallery</h3>
        <ProductGallery images={images} productName={product.name} />
      </article>

      <article className="detail-card">
        <h3>Product reviews</h3>
        <ProductReviewList reviews={reviews} reviewerLabels={reviewerLabels} />
      </article>

      <article className="detail-card">
        <h3>Write your review</h3>
        <p className="detail-muted">Share your opinion about this product listing.</p>
        <ProductReviewForm productId={productId} onSubmitSuccess={refresh} />
      </article>
    </section>
  )
}
