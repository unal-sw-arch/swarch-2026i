import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './components/login'
import Register from './components/Register'
import ProductCatalog from './components/ProductCatalog'
import aicartLogo from './assets/AICart.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem('authToken')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

function Dashboard() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    const token = sessionStorage.getItem('authToken')

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch {
      // Always continue with local logout even if API is unreachable.
    } finally {
      sessionStorage.removeItem('authToken')
      navigate('/', { replace: true })
    }
  }

  return (
    <>
      <section className="dashboard-topbar">
        <div className="dashboard-brand">
          <img src={aicartLogo} alt="AICart logo" className="dashboard-brand-logo" />
          <span className="dashboard-brand-name">AICart</span>
        </div>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Closing session...' : 'Logout'}
        </button>
      </section>

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Welcome to your E-commerce</h1>
          <p>
            You have successfully logged in. Start exploring our products.
          </p>
        </div>
      </section>

      <div className="ticks"></div>

      <ProductCatalog />

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App