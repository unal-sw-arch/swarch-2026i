import { cookies } from 'next/headers'
import UserProfilePage from '../../../components/profile/UserProfilePage'

const API_SERVER_URL = (process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:8000').replace(/\/$/, '')

function asArray(value) {
  return Array.isArray(value) ? value : []
}

async function getInitialData(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const authUser = await fetch(`${API_SERVER_URL}/auth/me`, { headers, cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
    if (!authUser) {
      return {
        authUser: null,
        userProfile: null,
        addresses: [],
        error: '',
        hydrated: false,
      }
    }

    const userProfile = await fetch(`${API_SERVER_URL}/users/by-email?email=${encodeURIComponent(authUser.email)}`, { headers, cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
    if (!userProfile) {
      return {
        authUser,
        userProfile: null,
        addresses: [],
        error: 'No user profile was found in user-service for this account yet.',
        hydrated: true,
      }
    }

    const addresses = await fetch(`${API_SERVER_URL}/users/${userProfile.id}/addresses`, { headers, cache: 'no-store' }).then((r) => (r.ok ? r.json() : []))

    return {
      authUser,
      userProfile,
      addresses: asArray(addresses),
      error: '',
      hydrated: true,
    }
  } catch {
    return {
      authUser: null,
      userProfile: null,
      addresses: [],
      error: '',
      hydrated: false,
    }
  }
}

const EMPTY_PROFILE_DATA = {
  authUser: null,
  userProfile: null,
  addresses: [],
  error: '',
  hydrated: false,
}

export default async function ProfilePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  const initialData = token ? await getInitialData(token) : EMPTY_PROFILE_DATA

  return <UserProfilePage initialData={initialData} />
}
