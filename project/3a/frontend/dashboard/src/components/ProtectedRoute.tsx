// ProtectedRoute.tsx - Componente para proteger rutas que requieren autenticación
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function defaultRouteForRole(role: string | null): string {
  if (role === 'CUSTOMER') return '/customer';
  if (role === 'CHEF') return '/kitchen';
  if (role === 'WAITER') return '/orders';
  return '/';
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const role = getCurrentUserRole();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to={defaultRouteForRole(role)} replace />;
    }
  }

  // Renderizar contenido protegido
  return <>{children}</>;
}
