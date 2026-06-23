'use client'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import { fetchJsonWithAuth } from '../utils/api'

export function useUserProfile(initialData = {}) {
  const [profile, setProfile] = useState(initialData.userProfile || null)
  const [addresses, setAddresses] = useState(initialData.addresses || [])
  const [loading, setLoading] = useState(!initialData?.hydrated)
  const [error, setError] = useState(initialData.error || '')

  const loadUserData = async () => {
    setLoading(true)
    setError('')

    try {
      const authUser = await fetchJsonWithAuth(`${API_BASE_URL}/auth/me`)

      const userProfile = await fetchJsonWithAuth(
        `${API_BASE_URL}/users/by-email?email=${encodeURIComponent(authUser.email)}`
      )

      const userAddresses = await fetchJsonWithAuth(`${API_BASE_URL}/users/${userProfile.id}/addresses`)

      setProfile(userProfile)
      setAddresses(Array.isArray(userAddresses) ? userAddresses : [])
    } catch (err) {
      if (err.status === 404) {
        setError('No user profile was found in user-service for this account yet.')
      } else {
        setError(err.message || 'Could not load your user profile')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialData?.hydrated) {
      return
    }
    void loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    profile,
    addresses,
    loading,
    error,
    setProfile,
    setAddresses,
    refresh: loadUserData,
  }
}
