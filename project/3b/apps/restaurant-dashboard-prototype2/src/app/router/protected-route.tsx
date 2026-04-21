import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { useAuthStore } from "@/app/store/auth.store";
import { LoadingState } from "@/shared/components/feedback/loading-state";

export function ProtectedRoute() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isHydrated) {
    return (
      <main className="p-4 sm:p-6">
        <LoadingState label="Validando sesión..." />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
