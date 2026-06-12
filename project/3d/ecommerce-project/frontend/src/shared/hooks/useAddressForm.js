'use client'
import { useState } from 'react'
import { API_BASE_URL } from '../config/api'
import { fetchJsonWithAuth } from '../utils/api'

const createEmptyAddress = () => ({
  address_line: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  is_default: false,
})

export function useAddressForm(profile, onAddressAdded) {
  const [values, setValues] = useState(createEmptyAddress())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
      await fetchJsonWithAuth(`${API_BASE_URL}/users/${profile.id}/addresses`, {
        method: 'POST',
        body: JSON.stringify(values),
      })

      const userAddresses = await fetchJsonWithAuth(`${API_BASE_URL}/users/${profile.id}/addresses`)

      setValues(createEmptyAddress())
      setSuccess('Address added successfully.')

      if (onAddressAdded) {
        onAddressAdded(Array.isArray(userAddresses) ? userAddresses : [])
      }
    } catch (err) {
      setError(err.message || 'Could not save the address')
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
