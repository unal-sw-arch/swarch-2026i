/**
 * API utilities
 */
import { API_BASE_URL } from '../config/api'
import { getAuthHeaders } from '../lib/auth'
import { extractErrorDetail } from './format'

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(extractErrorDetail(data, `Request failed (${response.status})`))
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function fetchJsonWithAuth(url, options = {}) {
  return fetchJson(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  })
}

/**
 * Fetch user data from user-service or auth-service as fallback
 */
export async function fetchUserLabel(userId) {
  try {
    const userData = await fetchJsonWithAuth(`${API_BASE_URL}/users/${userId}`)
    return userData?.name || userData?.email || String(userId)
  } catch {
    try {
      const authData = await fetchJsonWithAuth(`${API_BASE_URL}/auth/users/${userId}`)
      return authData?.email || String(userId)
    } catch {
      return String(userId)
    }
  }
}

/**
 * Fetch multiple user labels in parallel
 */
export async function fetchUserLabels(userIds) {
  const entries = await Promise.all(
    userIds.map(async (id) => {
      const label = await fetchUserLabel(id)
      return [String(id), label]
    })
  )
  return Object.fromEntries(entries)
}
