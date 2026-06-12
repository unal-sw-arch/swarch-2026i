import { Navigate } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { LoadingState } from "@/shared/components/feedback/loading-state";

export function RestaurantRegisterPage() {
  const { isAuthenticated, isHydrated } = useAuthSession();

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4">
        <div className="w-full max-w-md">
          <LoadingState label="Cargando sesion..." />
        </div>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_40%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8">
      <RegisterForm />
    </main>
  );
}
