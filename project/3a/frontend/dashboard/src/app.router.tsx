import { createBrowserRouter, Navigate } from 'react-router'
import { DashboardPage } from './admin/pages/dashboard/DashboardPage'
import { AdminProductsPage } from './admin/pages/products/AdminProductsPage'
import { AdminProductPage } from './admin/pages/product/AdminProductPage'
import { AdminUsersPage } from './admin/pages/users/AdminUsersPage'
import { AdminOrdersPage } from './admin/pages/orders/AdminOrdersPage'
import { AdminReportsPage } from './admin/pages/reports/AdminReportsPage'
import { AdminNotificationsPage } from './admin/pages/notifications/AdminNotificationsPage'
import { AdminSettingsPage } from './admin/pages/settings/AdminSettingsPage'
import { AdminHelpPage } from './admin/pages/help/AdminHelpPage'
import { AdminReservationsPage } from './admin/pages/reservations/AdminReservationsPage'
import { AdminRestaurantsPage } from './admin/pages/restaurants/AdminRestaurantsPage'
import { AdminRatingsPage } from './admin/pages/ratings/AdminRatingsPage'
import { RegisterPage } from './auth/pages/register/RegisterPage'
import { lazy } from 'react'
import { LoginPage } from './auth/pages/login/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

const AuthLayout = lazy(() => import('./auth/layouts/AuthLayout'))
const AdminLayout = lazy( () => import('./admin/layouts/AdminLayout')) 

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute><AdminLayout/></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <DashboardPage/>
            },
            {
                path: 'products',
                element: <AdminProductsPage/>
            },
            {
                path: 'products/:idSlug',
                element: <AdminProductPage/>
            },
            {
                path: 'users',
                element: <AdminUsersPage/>
            },
            {
                path: 'orders',
                element: <AdminOrdersPage/>
            },
            {
                path: 'reservations',
                element: <AdminReservationsPage/>
            },
            {
                path: 'restaurants',
                element: <AdminRestaurantsPage/>
            },
            {
                path: 'ratings',
                element: <AdminRatingsPage/>
            },
            {
                path: 'reports',
                element: <AdminReportsPage/>
            },
            {
                path: 'notifications',
                element: <AdminNotificationsPage/>
            },
            {
                path: 'settings',
                element: <AdminSettingsPage/>
            },
            {
                path: 'help',
                element: <AdminHelpPage/>
            }
        ]
    },

    {
        path: '/auth',
        element: <AuthLayout/>,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login"/>
            },
            {
                path: 'login',
                element: <LoginPage/>
            },
            {
                path: 'register',
                element: <RegisterPage/>
            }
        ]
    },

    {
        path: '*',
        element: <Navigate to="/" />
    }

])