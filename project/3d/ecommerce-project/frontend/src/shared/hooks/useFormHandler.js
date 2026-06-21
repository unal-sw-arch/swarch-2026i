/**
 * Generic form handler hook
 */
import { useState } from 'react'

export function useFormHandler(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues)
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
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await onSubmit(values)
      setSuccess(result?.message || 'Success')
      if (result?.resetValues) {
        setValues(result.resetValues)
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
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
