'use client'
import { useState } from 'react'
import { API_BASE_URL } from '../config/api'
import { fetchJsonWithAuth } from '../utils/api'

export function useProfileForm(profile) {
  const [values, setValues] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!profile?.id) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: values.name.trim(),
        phone: values.phone.trim() || null,
      }

      const updatedProfile = await fetchJsonWithAuth(`${API_BASE_URL}/users/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setValues({
        name: updatedProfile.name || '',
        phone: updatedProfile.phone || '',
      })
      setSuccess('Profile updated successfully.')
      return updatedProfile
    } catch (err) {
      setError(err.message || 'Could not update your profile')
    } finally {
      setLoading(false)
    }
  }

  return {
    values,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
    setValues,
    setError,
    setSuccess,
  }
}
