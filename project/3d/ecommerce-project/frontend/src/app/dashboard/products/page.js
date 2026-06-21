import { cookies } from 'next/headers'
import ProductCatalogClient from '../../../pages/catalog/ProductCatalogClient'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

async function getInitialData(token) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  try {
    const [products, categories] = await Promise.all([
      fetch(`${API_SERVER_URL}/products/`, { headers, cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_SERVER_URL}/products/categories`, { headers, cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    ])
    return {
      products: Array.isArray(products) ? products : [],
      categories: Array.isArray(categories) ? categories : []
    }
  } catch (e) { 
    console.error('SSR fetch error:', e)
    return { products: [], categories: [] } 
  }
}

export default async function ProductsPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  const initialData = token ? await getInitialData(token) : { products: [], categories: [] }
  return <ProductCatalogClient initialProducts={initialData.products} initialCategories={initialData.categories} />
}
