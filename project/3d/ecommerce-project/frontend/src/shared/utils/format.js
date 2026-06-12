/**
 * Formatting utilities
 */

export function formatPrice(price) {
  const value = Number(price)
  if (Number.isNaN(value)) return String(price)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function extractErrorDetail(data, fallback) {
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
