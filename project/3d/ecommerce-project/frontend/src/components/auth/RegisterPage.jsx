'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '../../shared/config/api'
import { fetchWithGatewayRetry } from '../../shared/lib/http'
import aicartLogo from '../../assets/AICart.png'
import './RegisterPage.css'

const RegisterPage = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetchWithGatewayRetry(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password }),
      }, 3, 600)

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setSuccess('User created successfully')
        setTimeout(() => router.push('/'), 2000)
      } else {
        if ([502, 503, 504].includes(response.status)) {
          setError('Services are warming up. Please try again in a few seconds.')
        } else {
          setError(typeof data.detail === 'string' ? data.detail : Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : 'Error registering user')
        }
      }
    } catch (err) {
      setError('Server connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="auth-brand">
          <img src={aicartLogo.src} alt="AICart logo" className="auth-brand-logo" />
          <p className="auth-brand-name">AICart</p>
        </div>

        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
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
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <p className="login-link">
          Already have an account? <Link href="/">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage