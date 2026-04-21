import { cookies } from 'next/headers'
import OrdersPage from '../../../pages/orders/OrdersPage'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

function createEmptyOrdersData() {
  return {
    hydrated: false,
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
    error: '',
  }
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

async function getInitialData(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const response = await fetch(`${API_SERVER_URL}/orders/?page=1&page_size=20`, {
      headers,
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ...createEmptyOrdersData(),
        hydrated: true,
        error: extractErrorDetail(data, 'Could not load your orders right now.'),
      }
    }

    return {
      hydrated: true,
      items: Array.isArray(data?.items) ? data.items : [],
      total: Number(data?.total || 0),
      page: Number(data?.page || 1),
      page_size: Number(data?.page_size || 20),
      error: '',
    }
  } catch {
    return {
      ...createEmptyOrdersData(),
      hydrated: false,
    }
  }
}

export default async function OrdersPageRoute() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  const initialData = token
    ? await getInitialData(token)
    : createEmptyOrdersData()

  return <OrdersPage initialData={initialData} />
}
