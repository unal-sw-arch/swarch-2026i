'use client'
import { useState } from 'react'
import { API_BASE_URL } from '../config/api'
import { fetchJsonWithAuth } from '../utils/api'

export function useProductActivity() {
  const [myListings, setMyListings] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [reviewsReceived, setReviewsReceived] = useState([])
  const [salesOnMyProducts, setSalesOnMyProducts] = useState([])
  const [myPaidOrders, setMyPaidOrders] = useState([])
  const [productLabels, setProductLabels] = useState({})
  const [reviewerLabels, setReviewerLabels] = useState({})
  const [buyerLabels, setBuyerLabels] = useState({})
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState('')

  const fetchProductLabel = async (id) => {
    try {
      const response = await fetchJsonWithAuth(`${API_BASE_URL}/products/${id}`)
      return [String(id), response?.name || String(id)]
    } catch {
      return [String(id), String(id)]
    }
  }

  const fetchUserLabels = async (userIds) => {
    const entries = await Promise.all(
      userIds.map(async (id) => {
        try {
          const userData = await fetchJsonWithAuth(`${API_BASE_URL}/users/${id}`)
          return [String(id), userData?.name || userData?.email || String(id)]
        } catch {
          try {
            const authData = await fetchJsonWithAuth(`${API_BASE_URL}/auth/users/${id}`)
            return [String(id), authData?.email || String(id)]
          } catch {
            return [String(id), String(id)]
          }
        }
      })
    )
    return Object.fromEntries(entries)
  }

  const load = async () => {
    setLoading(true)
    setWarning('')
    setMyListings([])
    setMyReviews([])
    setReviewsReceived([])
    setSalesOnMyProducts([])
    setMyPaidOrders([])
    setProductLabels({})
    setReviewerLabels({})
    setBuyerLabels({})

    try {
      const calls = await Promise.allSettled([
        fetchJsonWithAuth(`${API_BASE_URL}/products/mine/reviews`),
        fetchJsonWithAuth(`${API_BASE_URL}/products/mine/reviews-received`),
        fetchJsonWithAuth(`${API_BASE_URL}/products/mine/listings`),
        fetchJsonWithAuth(`${API_BASE_URL}/orders/sales/mine?page=1&page_size=50`),
        fetchJsonWithAuth(`${API_BASE_URL}/orders/?status=paid&page=1&page_size=50`),
      ])

      const authoredReviews = calls[0].status === 'fulfilled' ? calls[0].value : []
      const sellerReviews = calls[1].status === 'fulfilled' ? calls[1].value : []
      const listings = calls[2].status === 'fulfilled' ? calls[2].value : []
      const salesResult = calls[3].status === 'fulfilled' ? calls[3].value : {}
      const paidOrdersResult = calls[4].status === 'fulfilled' ? calls[4].value : {}

      const hasProductFailures = calls.slice(0, 3).some((call) => call.status === 'rejected')
      const hasSalesFailures = calls[3].status === 'rejected'

      if (hasProductFailures && hasSalesFailures) {
        setWarning('Product and sales data are temporarily unavailable. Profile data remains available.')
      } else if (hasProductFailures) {
        setWarning('Product service is unavailable. Profile data remains available, but listing/review sections may be incomplete.')
      } else if (hasSalesFailures) {
        setWarning('Sales information is temporarily unavailable right now.')
      }

      const safeListings = Array.isArray(listings) ? listings : []
      const safeMyReviews = Array.isArray(authoredReviews) ? authoredReviews : []
      const safeSellerReviews = Array.isArray(sellerReviews) ? sellerReviews : []
      const safeSales = Array.isArray(salesResult?.items) ? salesResult.items : []

      const safePaidOrders = Array.isArray(paidOrdersResult?.items) ? paidOrdersResult.items : []

      setMyListings(safeListings)
      setMyReviews(safeMyReviews)
      setReviewsReceived(safeSellerReviews)
      setSalesOnMyProducts(safeSales)
      setMyPaidOrders(safePaidOrders)

      const listingLabelMap = Object.fromEntries(
        safeListings.map((product) => [String(product.id), product.name || String(product.id)])
      )

      const reviewedProductIds = [
        ...new Set([...safeMyReviews, ...safeSellerReviews].map((review) => String(review.product_id))),
      ]
      const missingProductIds = reviewedProductIds.filter((id) => !listingLabelMap[id])

      const fetchedProductLabels = await Promise.allSettled(missingProductIds.map(fetchProductLabel))

      const productEntries = fetchedProductLabels
        .filter((entry) => entry.status === 'fulfilled')
        .map((entry) => entry.value)

      if (!hasProductFailures && fetchedProductLabels.some((entry) => entry.status === 'rejected')) {
        setWarning('Some product labels could not be loaded at this moment.')
      }

      setProductLabels({
        ...listingLabelMap,
        ...Object.fromEntries(productEntries),
      })

      const reviewerIds = [...new Set(safeSellerReviews.map((review) => String(review.reviewer_user_id)))]
      const reviewerMap = await fetchUserLabels(reviewerIds)
      setReviewerLabels(reviewerMap)

      const buyerIds = [
        ...new Set(safeSales.map((sale) => String(sale.buyer_user_id)).filter(Boolean)),
      ]
      const buyerMap = await fetchUserLabels(buyerIds)
      setBuyerLabels(buyerMap)
    } catch {
      setWarning('Product information is temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return {
    myListings,
    myReviews,
    reviewsReceived,
    salesOnMyProducts,
    myPaidOrders,
    productLabels,
    reviewerLabels,
    buyerLabels,
    loading,
    warning,
    load,
  }
}
