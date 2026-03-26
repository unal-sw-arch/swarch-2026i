import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RestaurantApp } from './RestaurantApp.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RestaurantApp />
    </AuthProvider>
  </StrictMode>,
)
