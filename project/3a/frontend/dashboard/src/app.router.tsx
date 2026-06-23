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
import { ChefKitchenPage } from './admin/pages/kitchen/ChefKitchenPage'
import { RegisterPage } from './auth/pages/register/RegisterPage'
import { CustomerLayout } from './customer/layouts/CustomerLayout'
import { lazy } from 'react'
import { LoginPage } from './auth/pages/login/LoginPage'
import { TablesPage } from './admin/pages/tables/RestaurantTables'
import { HoursPage } from './admin/pages/hours/HoursPage'
import ProtectedRoute from './components/ProtectedRoute'

const AuthLayout = lazy(() => import('./auth/layouts/AuthLayout'))
const AdminLayout = lazy( () => import('./admin/layouts/AdminLayout')) 
const adminRoles = ['ADMIN', 'RESTAURANT_MANAGER']
const waiterRoles = ['ADMIN', 'RESTAURANT_MANAGER', 'WAITER']
const chefRoles = ['ADMIN', 'RESTAURANT_MANAGER', 'CHEF']
const staffRoles = ['ADMIN', 'RESTAURANT_MANAGER', 'WAITER', 'CHEF']

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute allowedRoles={staffRoles}><AdminLayout/></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <ProtectedRoute allowedRoles={adminRoles}><DashboardPage/></ProtectedRoute>
            },
            {
                path: 'products',
                element: <ProtectedRoute allowedRoles={adminRoles}><AdminProductsPage/></ProtectedRoute>
            },
            {
                path: 'products/:idSlug',
                element: <ProtectedRoute allowedRoles={adminRoles}><AdminProductPage/></ProtectedRoute>
            },
            {
                path: 'users',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage/></ProtectedRoute>
            },
            {
                path: 'orders',
                element: <ProtectedRoute allowedRoles={waiterRoles}><AdminOrdersPage/></ProtectedRoute>
            },
            {
                path: 'kitchen',
                element: <ProtectedRoute allowedRoles={chefRoles}><ChefKitchenPage/></ProtectedRoute>
            },
            {
                path: 'reservations',
                element: <ProtectedRoute allowedRoles={waiterRoles}><AdminReservationsPage/></ProtectedRoute>
            },
            {
                path: 'restaurants',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminRestaurantsPage/></ProtectedRoute>
            },
            {
                path: 'ratings',
                element: <ProtectedRoute allowedRoles={adminRoles}><AdminRatingsPage/></ProtectedRoute>
            },
            {
                path: 'reports',
                element: <ProtectedRoute allowedRoles={adminRoles}><AdminReportsPage/></ProtectedRoute>
            },
            {
                path: 'notifications',
                element: <ProtectedRoute allowedRoles={adminRoles}><AdminNotificationsPage/></ProtectedRoute>
            },
            {
                path: 'settings',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminSettingsPage/></ProtectedRoute>
            },
            {
                path: 'help',
                element: <ProtectedRoute allowedRoles={['ADMIN']}><AdminHelpPage/></ProtectedRoute>
            },
            {
                path: 'tables',
                element: <ProtectedRoute allowedRoles={waiterRoles}><TablesPage/></ProtectedRoute>
            },
            {
                path: 'hours',
                element: <ProtectedRoute allowedRoles={adminRoles}><HoursPage/></ProtectedRoute>
            },
            


        ]
    },

    {
        path: '/customer',
        element: <ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerLayout/></ProtectedRoute>
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