'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '../../shared/config/api'
import { fetchWithGatewayRetry } from '../../shared/lib/http'
import { setAuthToken } from '../../shared/lib/auth'
import Image from 'next/image'
import aicartLogo from '../../assets/AICart.png'
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetchWithGatewayRetry(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 3)

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setAuthToken(data.access_token)
        router.push('/dashboard')
      } else {
        if ([502, 503, 504].includes(response.status)) {
          setError('Services are warming up. Please try again in a few seconds.')
        } else {
          setError(typeof data.detail === 'string' ? data.detail : Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : 'Invalid credentials')
        }
      }
    } catch (err) {
      setError('Server connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="auth-brand">
          <img src={aicartLogo.src} alt="AICart logo" className="auth-brand-logo" />
          <p className="auth-brand-name">AICart</p>
        </div>

        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <p className="register-link">
          Don&apos;t have an account? <Link href="/register">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage