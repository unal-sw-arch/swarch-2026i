/**
 * Hook for loading product details and related data
 */
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api'
import { fetchJsonWithAuth, fetchUserLabels } from '../utils/api'

export function useProductDetail(productId, initialData = {}) {
  const hasInitialData = Boolean(initialData?.hydrated)

  const [product, setProduct] = useState(initialData.product || null)
  const [categoryName, setCategoryName] = useState(initialData.categoryName || 'Unknown')
  const [sellerName, setSellerName] = useState(initialData.sellerName || 'Unknown')
  const [images, setImages] = useState(initialData.images || [])
  const [reviews, setReviews] = useState(initialData.reviews || [])
  const [reviewerLabels, setReviewerLabels] = useState(initialData.reviewerLabels || {})
  const [loading, setLoading] = useState(!hasInitialData)
  const [error, setError] = useState(initialData.error || '')
  const [warning, setWarning] = useState(initialData.warning || '')

  const loadData = async () => {
    if (!productId) {
      setError('Invalid product ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    setWarning('')
    const warnings = []

    try {
      // Load main data in parallel
      const [productResult, reviewsResult, categoriesResult, imagesResult] = await Promise.allSettled([
        fetchJsonWithAuth(`${API_BASE_URL}/products/${productId}`),
        fetchJsonWithAuth(`${API_BASE_URL}/products/${productId}/reviews`),
        fetchJsonWithAuth(`${API_BASE_URL}/products/categories`),
        fetchJsonWithAuth(`${API_BASE_URL}/products/${productId}/images`),
      ])

      if (productResult.status !== 'fulfilled') {
        throw new Error('Could not load product')
      }

      const productData = productResult.value
      const reviewsData = reviewsResult.status === 'fulfilled' ? reviewsResult.value : []
      const categoriesData = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
      const imagesData = imagesResult.status === 'fulfilled' ? imagesResult.value : []

      if (reviewsResult.status !== 'fulfilled') warnings.push('Reviews unavailable')
      if (categoriesResult.status !== 'fulfilled') warnings.push('Categories unavailable')
      if (imagesResult.status !== 'fulfilled') warnings.push('Images unavailable')

      // Get seller name
      try {
        const sellerData = await fetchJsonWithAuth(`${API_BASE_URL}/users/${productData.seller_user_id}`)
        setSellerName(sellerData?.name || sellerData?.email || 'Unknown')
      } catch {
        setSellerName('Unknown')
      }

      // Get category name
      const matchedCategory = categoriesData.find((cat) => cat.id === productData.category_id)
      setCategoryName(matchedCategory?.name || 'Unknown')

      // Get reviewer labels
      const reviewerIds = [
        ...new Set((Array.isArray(reviewsData) ? reviewsData : []).map((r) => r.reviewer_user_id).filter(Boolean)),
      ]
      if (reviewerIds.length > 0) {
        const labels = await fetchUserLabels(reviewerIds)
        setReviewerLabels(labels)
      }

      setProduct(productData)
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setImages(Array.isArray(imagesData) ? imagesData : [])

      if (warnings.length > 0) {
        setWarning(warnings.join('; '))
      }
    } catch (err) {
      setError(err.message || 'Could not load product')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data or sync from props
  useEffect(() => {
    if (hasInitialData) {
      setProduct(initialData.product || null)
      setCategoryName(initialData.categoryName || 'Unknown')
      setSellerName(initialData.sellerName || 'Unknown')
      setImages(initialData.images || [])
      setReviews(initialData.reviews || [])
      setReviewerLabels(initialData.reviewerLabels || {})
      setWarning(initialData.warning || '')
      return
    }

    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, hasInitialData])

  return {
    product,
    categoryName,
    sellerName,
    images,
    reviews,
    reviewerLabels,
    loading,
    error,
    warning,
    refresh: loadData,
  }
}
