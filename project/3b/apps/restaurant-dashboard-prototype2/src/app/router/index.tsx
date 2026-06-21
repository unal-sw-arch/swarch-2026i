import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/layout/app-layout";
import { ROUTES } from "@/app/config/routes";
import { ProtectedRoute } from "@/app/router/protected-route";
import { RestaurantLoginPage } from "@/features/auth/pages/restaurant-login.page";
import { RestaurantRegisterPage } from "@/features/auth/pages/restaurant-register.page";
import { DashboardHomePage } from "@/features/dashboard/pages/dashboard-home.page";
import { OrdersPage } from "@/features/orders/pages/orders.page";
import { KitchenQueuePage } from "@/features/kitchen/pages/kitchen-queue.page";
import { ProductsPage } from "@/features/products/pages/products.page";

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <RestaurantLoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RestaurantRegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardHomePage /> },
          { path: ROUTES.ORDERS.slice(1), element: <OrdersPage /> },
          { path: ROUTES.KITCHEN.slice(1), element: <KitchenQueuePage /> },
          { path: ROUTES.PRODUCTS.slice(1), element: <ProductsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
