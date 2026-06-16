'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { API_BASE_URL } from '../../shared/config/api'
import { clearAuthToken, getAuthToken } from '../../shared/lib/auth'
// import aicartLogo from '../../assets/AICart.png'
// import heroImg from '../../assets/hero.png'
import './DashboardLayout.css'
import ChatWidget from './ChatWidget'

const NAV_ITEMS = [
  {
    href: '/dashboard/products',
    label: 'Catalog',
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
  },
  {
    href: '/dashboard/my-products',
    label: 'My products',
  },
  {
    href: '/dashboard/profile',
    label: 'My profile',
  },
]

const HERO_SECTIONS = {
  products: {
    key: 'products',
    kicker: 'Catalog Workspace',
    title: 'Discover products that match your strategy',
    lead: 'Browse categories quickly, compare options, and decide what to add next from one clear dashboard.',
    badges: ['Smart filters', 'Live availability', 'Fast checkout'],
    metricValue: '24/7',
    metricLabel: 'live access to your product catalog',
  },
  orders: {
    key: 'orders',
    kicker: 'Order Center',
    title: 'Track your purchases from creation to delivery',
    lead: 'Review status changes, inspect line items, and cancel eligible orders without leaving your dashboard.',
    badges: ['Live status', 'Cancel eligible orders', 'Full shipping snapshot'],
    metricValue: '1 click',
    metricLabel: 'to review your latest purchase details',
  },
  'my-products': {
    key: 'my-products',
    kicker: 'Seller Studio',
    title: 'Manage listings with precision and speed',
    lead: 'Keep prices, stock, and product details up to date while staying focused on growth and conversions.',
    badges: ['Bulk-ready edits', 'Stock control', 'Price updates'],
    metricValue: '3x',
    metricLabel: 'faster listing updates for active sellers',
  },
  profile: {
    key: 'profile',
    kicker: 'Profile Hub',
    title: 'Keep your account trusted and complete',
    lead: 'Update identity, contact details, and shipping information to keep every checkout smooth and reliable.',
    badges: ['Verified profile', 'Address book', 'Secure account'],
    metricValue: '100%',
    metricLabel: 'control over your account information',
  },
}

function getActiveSection(pathname) {
  if (pathname?.startsWith('/dashboard/orders')) {
    return HERO_SECTIONS.orders
  }

  if (pathname?.startsWith('/dashboard/my-products')) {
    return HERO_SECTIONS['my-products']
  }

  if (pathname?.startsWith('/dashboard/profile')) {
    return HERO_SECTIONS.profile
  }

  return HERO_SECTIONS.products
}

function getViewerAlias(label) {
  if (!label || typeof label !== 'string') return 'Seller'

  const sanitizedLabel = label.trim()
  if (!sanitizedLabel) return 'Seller'

  if (sanitizedLabel.includes('@')) {
    const localPart = sanitizedLabel.split('@')[0]
    const preferredAlias = localPart
      .split(/[._-]+/)
      .find((token) => token)

    if (!preferredAlias) return 'Seller'
    return preferredAlias.charAt(0).toUpperCase() + preferredAlias.slice(1)
  }

  const firstWord = sanitizedLabel.split(/\s+/)[0]
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1)
}

export default function DashboardLayout({ children, initialViewerLabel = 'Seller' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const activeSection = useMemo(() => getActiveSection(pathname), [pathname])
  const viewerName = useMemo(() => getViewerAlias(initialViewerLabel), [initialViewerLabel])

  const isNavItemActive = (href) => pathname === href || pathname?.startsWith(`${href}/`)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    const token = getAuthToken()

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
      // Continue local logout even if API is unavailable.
    } finally {
      clearAuthToken()
      router.replace('/')
    }
  }

  return (
    <div className="dashboard-shell">
      <section className="dashboard-topbar">
        <div className="dashboard-brand">
          
          <span className="dashboard-brand-name">AICart</span>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboard-nav-link${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="dashboard-nav-link-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          className="logout-button"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Closing session...' : 'Logout'}
        </button>
      </section>

      <section
        className={`dashboard-hero dashboard-hero--${activeSection.key}`}
        aria-labelledby="dashboard-hero-title"
      >
        <div className="dashboard-hero-copy">
          <p className="dashboard-hero-kicker">{activeSection.kicker}</p>
          <p className="dashboard-hero-greeting">Hello, {viewerName}.</p>
          <h1 id="dashboard-hero-title">{activeSection.title}</h1>
          <p className="dashboard-hero-lead">{activeSection.lead}</p>
          <div className="dashboard-hero-badges" aria-label="Key dashboard benefits">
            {activeSection.badges.map((badge) => (
              <span key={badge} className="dashboard-hero-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <aside className="dashboard-hero-aside" aria-label="Dashboard highlights">
          <div className="dashboard-hero-metric">
            <p className="dashboard-hero-metric-value">{activeSection.metricValue}</p>
            <p className="dashboard-hero-metric-label">{activeSection.metricLabel}</p>
          </div>
        </aside>
      </section>

      <section className="dashboard-content">
        {children}
      </section>
    <ChatWidget />
    </div>
  )
}
