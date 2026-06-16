import { cookies } from 'next/headers'
import DashboardLayout from '../../widgets/dashboard/DashboardLayout'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

async function getInitialViewerLabel(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const response = await fetch(`${API_SERVER_URL}/auth/me`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      return 'Seller'
    }

    const authUser = await response.json().catch(() => null)
    return authUser?.name || authUser?.full_name || authUser?.email || 'Seller'
  } catch {
    return 'Seller'
  }
}

export const dynamic = 'force-dynamic'

export default async function Layout({ children }) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  const initialViewerLabel = token ? await getInitialViewerLabel(token) : 'Seller'

  return <DashboardLayout initialViewerLabel={initialViewerLabel}>{children}</DashboardLayout>
}
