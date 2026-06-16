export async function fetchWithGatewayRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (response.status < 500) return response // errores 4xx no se reintentan
    } catch (err) {
      if (i === retries - 1) throw err
    }
    await new Promise(res => setTimeout(res, 500 * (i + 1)))
  }
}
