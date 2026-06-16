import { cookies } from 'next/headers'
import MyProductsPage from '../../../components/seller/MyProductsPage'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

async function getInitialData(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const [categories, listings] = await Promise.all([
      fetch(`${API_SERVER_URL}/products/categories`, { headers, cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_SERVER_URL}/products/mine/listings`, { headers, cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])),
    ])

    return {
      categories: Array.isArray(categories) ? categories : [],
      listings: Array.isArray(listings) ? listings : [],
      hydrated: true,
    }
  } catch {
    return {
      categories: [],
      listings: [],
      hydrated: false,
    }
  }
}

export default async function MyProductsPageRoute() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  const initialData = token
    ? await getInitialData(token)
    : { categories: [], listings: [], hydrated: false }

  return <MyProductsPage initialData={initialData} />
}
