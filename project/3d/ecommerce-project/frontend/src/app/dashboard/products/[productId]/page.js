import { cookies } from 'next/headers'
import ProductDetailPage from '../../../../pages/catalog/ProductDetailPage'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function createEmptyDetailData() {
  return {
    hydrated: false,
    product: null,
    reviews: [],
    images: [],
    reviewerLabels: {},
    categoryName: 'Unknown category',
    sellerName: 'Unknown seller',
    loadWarning: '',
    error: '',
  }
}

async function fetchJson(url, headers) {
  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    })
    const data = await response.json().catch(() => null)

    return { ok: response.ok, data }
  } catch {
    return { ok: false, data: null }
  }
}

async function resolveUserLabel(userId, headers) {
  const fallback = String(userId || 'Unknown seller')

  const userResult = await fetchJson(`${API_SERVER_URL}/users/${userId}`, headers)
  if (userResult.ok) {
    return userResult.data?.name || userResult.data?.email || fallback
  }

  const authResult = await fetchJson(`${API_SERVER_URL}/auth/users/${userId}`, headers)
  if (authResult.ok) {
    return authResult.data?.email || fallback
  }

  return fallback
}

async function getInitialData(token, productId) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const warningMessages = []

    const [
      productResult,
      reviewsResult,
      categoriesResult,
      imagesResult,
    ] = await Promise.all([
      fetchJson(`${API_SERVER_URL}/products/${productId}`, headers),
      fetchJson(`${API_SERVER_URL}/products/${productId}/reviews`, headers),
      fetchJson(`${API_SERVER_URL}/products/categories`, headers),
      fetchJson(`${API_SERVER_URL}/products/${productId}/images`, headers),
    ])

    if (!productResult.ok || !productResult.data) {
      return {
        ...createEmptyDetailData(),
        hydrated: true,
        error: 'Could not load product details',
      }
    }

    const product = productResult.data
    const safeReviews = asArray(reviewsResult.data)
    const safeCategories = asArray(categoriesResult.data)
    const safeImages = asArray(imagesResult.data)

    if (!reviewsResult.ok) {
      warningMessages.push('Reviews are temporarily unavailable.')
    }

    if (!categoriesResult.ok) {
      warningMessages.push('Category labels are temporarily unavailable.')
    }

    if (!imagesResult.ok) {
      warningMessages.push('Product gallery is temporarily unavailable.')
    }

    const matchedCategory = safeCategories.find((category) => category.id === product.category_id)
    const categoryName = matchedCategory?.name || 'Unknown category'

    let sellerName = 'Unknown seller'
    if (product?.seller_user_id) {
      sellerName = await resolveUserLabel(product.seller_user_id, headers)
    }

    const reviewerIds = [
      ...new Set(safeReviews.map((review) => review?.reviewer_user_id).filter(Boolean)),
    ]

    const reviewerResults = await Promise.allSettled(
      reviewerIds.map(async (reviewerId) => [String(reviewerId), await resolveUserLabel(reviewerId, headers)])
    )

    const reviewerLabels = Object.fromEntries(
      reviewerResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
    )

    if (reviewerResults.some((result) => result.status === 'rejected')) {
      warningMessages.push('Some reviewer labels could not be loaded.')
    }

    return {
      hydrated: true,
      product,
      reviews: safeReviews,
      images: safeImages,
      reviewerLabels,
      categoryName,
      sellerName,
      loadWarning: warningMessages.join(' '),
      error: '',
    }
  } catch {
    return {
      ...createEmptyDetailData(),
      hydrated: false,
      error: 'Could not load product details',
    }
  }
}

export default async function ProductDetail({ params }) {
  const productId = params?.productId || ''
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!productId) {
    return (
      <ProductDetailPage
        productId=""
        initialData={{
          ...createEmptyDetailData(),
          hydrated: true,
          error: 'Invalid product identifier.',
        }}
      />
    )
  }

  if (!token) {
    return <ProductDetailPage productId={productId} initialData={createEmptyDetailData()} />
  }

  const initialData = await getInitialData(token, productId)
  return <ProductDetailPage productId={productId} initialData={initialData} />
}
